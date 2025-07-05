import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper per creare un client Supabase in una Route Handler
async function createSupabaseRouteHandlerClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
                remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
            },
        }
    );
}

// POST: Aggiungere un like
export async function POST(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const postId = params.postId;
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('likes')
        .insert({
            user_id: user.id,
            post_id: postId,
        })
        .select()
        .single();

    if (error) {
        // L'errore 23505 è "unique_violation", che qui significa "like già esistente".
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Like già esistente' }, { status: 409 });
        }
        console.error("Errore nell'aggiungere il like:", error);
        return NextResponse.json({ error: "Impossibile aggiungere il like" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}


// DELETE: Rimuovere un like
export async function DELETE(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const postId = params.postId;
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

    if (error) {
        console.error("Errore nel rimuovere il like:", error);
        return NextResponse.json({ error: "Impossibile rimuovere il like" }, { status: 500 });
    }

    // Rispondiamo con 204 No Content, che è lo standard per una cancellazione riuscita.
    return new NextResponse(null, { status: 204 });
} 