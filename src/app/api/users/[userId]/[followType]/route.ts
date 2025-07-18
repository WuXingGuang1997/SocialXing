import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
    request: Request,
    { params }: { params: { userId: string; followType: 'followers' | 'following' } }
) {
    // Accedo ai params in questo modo per rispettare le convenzioni di Next.js
    const { userId, followType } = params;

    if (!userId || (followType !== 'followers' && followType !== 'following')) {
        return NextResponse.json({ error: 'Parametri non validi' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    
    const fromTable = 'followers';
    const selectId = followType === 'followers' ? 'follower_id' : 'following_id';
    const whereId = followType === 'followers' ? 'following_id' : 'follower_id';

    // 1. Prendi la lista di ID dalla tabella followers
    const { data: idList, error: idError } = await supabase
        .from(fromTable)
        .select(selectId)
        .eq(whereId, userId);

    if (idError) {
        console.error(`Errore nel recupero degli ID di ${followType}:`, idError);
        return NextResponse.json({ error: 'Errore nel recupero dati' }, { status: 500 });
    }

    if (!idList || idList.length === 0) {
        return NextResponse.json([], { status: 200 });
    }
    
    // Ora TypeScript sa che ogni item ha una chiave che corrisponde a `selectId`
    const userIds = idList.map(item => (item as { [key: string]: string })[selectId]);

    // 2. Prendi i profili completi usando la lista di ID
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

    if (profilesError) {
        console.error(`Errore nel recupero dei profili per ${followType}:`, profilesError);
        return NextResponse.json({ error: 'Errore nel recupero profili' }, { status: 500 });
    }

    return NextResponse.json(profiles);
}