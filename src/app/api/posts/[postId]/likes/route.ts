import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { postId: string } }
) {
    const { postId } = params;

    if (!postId) {
        return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from('likes')
        .select(`
            profiles (*)
        `)
        .eq('post_id', postId);
    
    if (error) {
        console.error("Error fetching likes:", error);
        return NextResponse.json({ error: "Could not fetch likes" }, { status: 500 });
    }

    // Restituiamo solo l'array di profili
    const profiles = data.map(item => item.profiles);

    return NextResponse.json(profiles);
} 