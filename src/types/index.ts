import { Tables } from '@/lib/supabase/database.types';

// Definizioni basate sullo schema del nostro DB
// Potremmo anche generarle automaticamente da Supabase, ma per ora le definiamo a mano.

export type Profile = Tables<'profiles'>;

export type Media = Tables<'media'> & {
    signedUrl?: string;
};

export type Like = {
  user_id: string;
};

export type Comment = {
  id: string;
  created_at: string;
  user_id: string;
  post_id: string;
  content: string;
  profiles: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>;
  comment_likes: { user_id: string }[];
  parent_id: string | null;
};

export type Post = {
  id: string;
  created_at: string;
  user_id: string;
  caption: string | null;
};

// Tipo combinato per un Post con tutti i dati correlati
export type PostWithData = Tables<'posts'> & {
    profiles: Profile | null;
    likes: { user_id: string }[];
    comments: { id: string }[];
    media: Media[];
};

export type CommentWithData = Tables<'comments'> & {
    profiles: Profile | null;
    comment_likes: { user_id: string }[];
    replies?: CommentWithData[]; 
}; 