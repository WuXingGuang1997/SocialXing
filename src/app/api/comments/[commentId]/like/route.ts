import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

// POST: Aggiungere un like a un commento
export async function POST(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const commentId = params.commentId;

    const { data, error } = await supabase
        .from('comment_likes')
        .insert({
            user_id: user.id,
            comment_id: commentId,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Like già esistente' }, { status: 409 });
        }
        console.error("Errore nell'aggiungere il like al commento:", error);
        return NextResponse.json({ error: "Impossibile aggiungere il like al commento" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}


// DELETE: Rimuovere un like da un commento
export async function DELETE(
    request: Request,
    { params }: { params: { commentId: string } }
) {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const commentId = params.commentId;

    const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', commentId);

    if (error) {
        console.error("Errore nel rimuovere il like dal commento:", error);
        return NextResponse.json({ error: "Impossibile rimuovere il like" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
} 