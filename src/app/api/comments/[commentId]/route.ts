import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

async function createSupabaseRouteHandlerClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );
}

// DELETE: Cancellare un commento
export async function DELETE(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    const commentId = params.commentId;
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // La policy RLS si occuperà della verifica della proprietà.
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error("Errore nella cancellazione del commento:", error);
        return NextResponse.json({ error: "Impossibile cancellare il commento." }, { status: 500 });
    }

    // Invalidiamo la cache dei post per aggiornare la lista commenti.
    // Un approccio più mirato sarebbe invalidare solo il post specifico,
    // ma per ora questo è più semplice e robusto.
    revalidatePath('/posts/[postId]', 'page');


    return NextResponse.json({ message: 'Commento eliminato con successo' });
}


// PUT: Modificare un commento
export async function PUT(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    const commentId = params.commentId;
    const { content } = await request.json();
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'Il contenuto non può essere vuoto' }, { status: 400 });
    }

    // La policy RLS si occuperà della verifica della proprietà.
    const { data, error } = await supabase
        .from('comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .select(`
            *,
            updated_at,
            profiles (*)
        `)
        .single();

    if (error) {
        console.error("Errore nell'aggiornamento del commento:", error);
        return NextResponse.json({ error: "Impossibile aggiornare il commento." }, { status: 500 });
    }
    
    revalidatePath('/posts/[postId]', 'page');

    return NextResponse.json(data);
} 