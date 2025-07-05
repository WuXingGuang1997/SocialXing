import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PostCard from '@/components/posts/post-card';
import { PostWithData, Media } from '@/types';

export const dynamic = 'force-dynamic';

interface HashtagPageProps {
  params: {
    tag: string;
  };
}

export default async function HashtagPage({ params }: HashtagPageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Sposto l'accesso a params qui, dopo il primo await, per risolvere l'avviso di Next.js
  const tagName = decodeURIComponent(params.tag).toLowerCase();

  // 1. Trova l'ID dell'hashtag
  const { data: hashtag } = await supabase
    .from('hashtags')
    .select('id')
    .eq('name', tagName)
    .single();

  if (!hashtag) {
    notFound();
  }

  // 2. Trova tutti i post collegati a questo hashtag
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!user_id(*),
      likes(user_id),
      comments(id),
      media(*),
      post_hashtags!inner(
        hashtags(name)
      )
    `)
    .in('id', 
      (await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtag.id)
      ).data?.map(p => p.post_id) || []
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Errore nel recupero dei post per l'hashtag:", error);
    // Gestire l'errore, magari mostrando un messaggio
  }

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
    <main className="max-w-xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">#{tagName}</h1>
        <p className="text-muted-foreground">{postsWithSignedUrls.length} post</p>
      </div>

      <div className="space-y-6">
        {postsWithSignedUrls.length > 0 ? (
          postsWithSignedUrls.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            Nessun post trovato per questo hashtag.
          </p>
        )}
      </div>
    </main>
  );
} 