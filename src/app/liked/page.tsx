import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PostCard from '@/components/posts/post-card';
import { PostWithData, Media } from '@/types';

export const revalidate = 0;

export default async function LikedPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        notFound();
    }

    const { data: likes, error } = await supabase
        .from('likes')
        .select('posts(*, profiles!posts_user_id_fkey(*), likes(user_id), comments(id), media(*))')
        .eq('user_id', user.id)
        .order('created_at', { foreignTable: 'posts', ascending: false });

    if (error) {
        console.error("Errore nel recupero dei post piaciuti:", error);
        return <div>Si è verificato un errore.</div>;
    }

    const posts = likes?.map(like => like.posts).filter(Boolean) as PostWithData[] || [];
    
    const likedPostsWithSignedUrls = posts ? await Promise.all(
        posts.map(async (post) => {
          const mediaWithSignedUrls = post.media ? await Promise.all(
            (post.media as Media[]).map(async (m) => {
              const { data } = await supabase.storage.from('media').createSignedUrl(m.file_path, 3600);
              return { ...m, signedUrl: data?.signedUrl || '' };
            })
          ) : [];
          return { ...post, media: mediaWithSignedUrls };
        })
      ) : [];


    if (likedPostsWithSignedUrls.length === 0) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold">Nessun post piaciuto</h2>
                <p className="text-muted-foreground">Inizia a mettere "mi piace" ai post per vederli qui.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Post piaciuti</h1>
            <div className="space-y-6">
                {likedPostsWithSignedUrls.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
} 