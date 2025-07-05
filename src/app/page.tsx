import { createSupabaseServerClient } from '@/lib/supabase/server';
import PostCard from '@/components/posts/post-card';
import { PostWithData, Media } from '@/types';

export const revalidate = 60;

export default async function Home() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            updated_at,
            profiles!user_id (*),
            media (*),
            likes (user_id),
            comments (id),
            post_hashtags(
                hashtags(name)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Errore nel recupero dei post:', error);
        return <p className="text-center text-red-500">Errore nel caricamento dei post. Riprova più tardi.</p>;
    }
    
    // Generiamo gli URL firmati per ogni media
    const postsWithSignedUrls: PostWithData[] = posts ? await Promise.all(
        posts.map(async (post) => {
            const mediaWithSignedUrls = await Promise.all(
                (post.media as Media[]).map(async (m) => {
                    const { data } = await supabase.storage.from('media').createSignedUrl(m.file_path, 3600);
                    return { ...m, signedUrl: data?.signedUrl || '' };
                })
            );
            return { ...post, media: mediaWithSignedUrls };
        })
    ) : [];


    return (
        <main className="max-w-lg mx-auto py-8 px-4">
            <div className="space-y-6">
                {postsWithSignedUrls?.map((post) => (
                    <PostCard key={post.id} post={post} currentUserId={user?.id} />
                ))}
            </div>
        </main>
    );
}
