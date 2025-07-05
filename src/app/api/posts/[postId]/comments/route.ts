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

// GET: Recuperare i commenti di un post
export async function GET(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const postId = params.postId;
    const supabase = await createSupabaseRouteHandlerClient();

    const { data: comments, error } = await supabase
        .from('comments')
        .select(`
            *,
            updated_at,
            profiles (*),
            comment_likes (user_id)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Errore nel recupero dei commenti:", error);
        return NextResponse.json({ error: "Impossibile recuperare i commenti" }, { status: 500 });
    }

    return NextResponse.json(comments);
}


// POST: Aggiungere un nuovo commento
export async function POST(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const { postId } = params;
    const { content, parent_comment_id } = await request.json(); 
    
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'Il contenuto del commento non può essere vuoto' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('comments')
        .insert({
            user_id: user.id,
            post_id: postId,
            content: content.trim(),
            parent_comment_id: parent_comment_id || null,
        })
        .select('*, profiles!user_id(id, username, full_name, avatar_url), comment_likes!comment_id(user_id)')
        .single();

    if (error) {
        console.error("Errore nell'aggiungere il commento:", error);
        return NextResponse.json({ error: "Impossibile aggiungere il commento" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
} 