import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PostCard from '@/components/posts/post-card';
import { PostWithData, Media } from '@/types';
import ProfileHeader from '@/components/profile/profile-header';
import { SupabaseClient } from '@supabase/supabase-js';
import ProfileTabs from '@/components/profile/profile-tabs';

export const dynamic = 'force-dynamic';

export const revalidate = 60; // Cache per 1 minuto

type ProfilePageProps = {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Funzione per recuperare il profilo per username O per ID
async function getProfile(supabase: SupabaseClient, identifier: string) {
    // Controlliamo se l'identifier è un UUID valido
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

    if (isUUID) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', identifier)
            .single();
        return { data, error };
    } else {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', identifier)
            .single();
        return { data, error };
    }
}

export default async function ProfilePage({ params: { username: identifier }, searchParams }: ProfilePageProps) {
  const supabase = await createSupabaseServerClient();
  const tab = searchParams.tab === 'liked' ? 'liked' : 'posts';

  // Recupera l'utente loggato
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  // Recupera il profilo usando la nuova funzione helper
  const { data: profile, error } = await getProfile(supabase, identifier);
  
  if (error || !profile) {
    notFound();
  }

  // Recupera i conteggi di follower e seguiti
  const { data: followData } = await supabase
    .from('profiles')
    .select(`
      followers_count:followers!following_id(count),
      following_count:followers!follower_id(count)
    `)
    .eq('id', profile.id)
    .single();
  
  // Controlla se l'utente corrente sta seguendo questo profilo
  const { data: isFollowingData } = await supabase
    .from('followers')
    .select('count')
    .eq('follower_id', currentUser?.id)
    .eq('following_id', profile.id)
    .single();

  const isFollowing = (isFollowingData?.count ?? 0) > 0;

  // Recupera il CONTEGGIO dei post creati dall'utente (sempre)
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id);

  // Recupera i post dell'utente o i post piaciuti in base al tab
  let posts: PostWithData[] | null = [];
  let postsError: any = null;

  if (tab === 'posts') {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!user_id (*),
        media (*),
        likes (user_id),
        comments (id),
        post_hashtags(
          hashtags(name)
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    posts = data;
    postsError = error;
  } else { // tab === 'liked'
    const { data: likes, error } = await supabase
        .from('likes')
        .select('posts(*, profiles!posts_user_id_fkey(*), likes(user_id), comments(id), media(*))')
        .eq('user_id', profile.id)
        .order('created_at', { foreignTable: 'posts', ascending: false });
    
    if (likes) {
        posts = likes.map(like => like.posts).filter(Boolean) as PostWithData[];
    }
    postsError = error;
  }


  if (postsError) {
    console.error("Errore nel recupero dei post:", postsError);
    // Non bloccare, mostra la pagina senza post
  }

  const postsWithSignedUrls: PostWithData[] = posts ? await Promise.all(
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

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <ProfileHeader
        key={profile.id}
        profile={{...profile, postsCount: postsCount ?? 0}}
        initialFollowersCount={followData?.followers_count?.[0]?.count ?? 0}
        initialFollowingCount={followData?.following_count?.[0]?.count ?? 0}
        initialIsFollowing={isFollowing}
      />

      <ProfileTabs username={profile.username} />

      <section className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {postsWithSignedUrls && postsWithSignedUrls.length > 0 ? (
            postsWithSignedUrls.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              {tab === 'posts'
                ? 'Questo utente non ha ancora pubblicato nessun post.'
                : 'Questo utente non ha ancora messo "mi piace" a nessun post.'}
            </p>
          )}
        </div>
      </section>
    </main>
  );
} 