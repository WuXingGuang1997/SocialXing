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

// DELETE: Cancellare un post
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

    // Per sicurezza, verifichiamo anche a livello di API che l'utente sia il proprietario
    const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (postError || !post || post.user_id !== user.id) {
        return NextResponse.json({ error: 'Post non trovato o non autorizzato' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (deleteError) {
        console.error("Errore nella cancellazione del post:", deleteError);
        return NextResponse.json({ error: "Impossibile cancellare il post." }, { status: 500 });
    }

    revalidatePath('/'); // Invalida la cache della homepage

    return NextResponse.json({ message: 'Post eliminato con successo' });
}


// PUT: Modificare un post (la didascalia)
export async function PUT(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { postId } = params;

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { content } = await request.json(); // Il form lo chiama 'content', ma la colonna è 'caption'

    if (!content) {
        return NextResponse.json({ error: 'Il contenuto non può essere vuoto' }, { status: 400 });
    }

    // Verifica che l'utente sia il proprietario del post
    const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (fetchError || !post) {
        return NextResponse.json({ error: 'Post non trovato' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
        return NextResponse.json({ error: 'Non hai i permessi per modificare questo post' }, { status: 403 });
    }

    // Aggiorna il post
    const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update({ caption: content, updated_at: new Date().toISOString() }) // Corretto da 'content' a 'caption'
        .eq('id', postId)
        .select('*, profiles!user_id(*), likes(user_id), comments(id), media(*)')
        .single();

    if (updateError) {
        console.error("Errore nell'aggiornamento del post:", updateError);
        return NextResponse.json({ error: "Impossibile aggiornare il post." }, { status: 500 });
    }
    
    // (La logica per gestire gli hashtag andrebbe anche qui)

    revalidatePath(`/`);
    revalidatePath(`/profile/${user.id}`); // Assumendo che il profilo usi l'ID
    revalidatePath(`/posts/${postId}`);

    return NextResponse.json(updatedPost);
} 