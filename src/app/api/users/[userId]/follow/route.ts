import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// POST: Seguire un utente
export async function POST(
    request: Request,
    { params }: { params: { userId: string } }
) {
    const supabase = await createSupabaseServerClient();
    const { userId } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const followerId = user.id;

    // Prevenire self-follow
    if (followerId === userId) {
        return NextResponse.json({ error: 'Non puoi seguire te stesso' }, { status: 400 });
    }

    const { error } = await supabase
        .from('followers')
        .insert({ follower_id: followerId, following_id: userId });

    if (error) {
        console.error('Errore nel follow:', error);
        return NextResponse.json({ error: "Impossibile seguire l'utente" }, { status: 500 });
    }

    // Revalida le pagine dei profili per aggiornare i conteggi
    const { data: followerProfile } = await supabase.from('profiles').select('username').eq('id', followerId).single();
    const { data: followingProfile } = await supabase.from('profiles').select('username').eq('id', userId).single();

    if (followerProfile?.username) {
        revalidatePath(`/profile/${followerProfile.username}`);
    }
    if (followingProfile?.username) {
        revalidatePath(`/profile/${followingProfile.username}`);
    }
    revalidatePath('/'); // Revalida anche la home page/feed

    return NextResponse.json({ success: true });
}

// DELETE: Smettere di seguire un utente
export async function DELETE(
    request: Request,
    { params }: { params: { userId: string } }
) {
    const supabase = await createSupabaseServerClient();
    const { userId } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    const followerId = user.id;

    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', userId);

    if (error) {
        console.error("Errore nell'unfollow:", error);
        return NextResponse.json({ error: "Impossibile smettere di seguire l'utente" }, { status: 500 });
    }

    // Revalida le pagine dei profili per aggiornare i conteggi
    const { data: followerProfile } = await supabase.from('profiles').select('username').eq('id', followerId).single();
    const { data: followingProfile } = await supabase.from('profiles').select('username').eq('id', userId).single();

    if (followerProfile?.username) {
        revalidatePath(`/profile/${followerProfile.username}`);
    }
    if (followingProfile?.username) {
        revalidatePath(`/profile/${followingProfile.username}`);
    }
    revalidatePath('/'); // Revalida anche la home page/feed

    return NextResponse.json({ success: true });
} 