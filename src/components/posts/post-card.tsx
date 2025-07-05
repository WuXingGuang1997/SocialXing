'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { PostWithData } from '@/types'; // Creeremo questo tipo tra un attimo
import Link from 'next/link'; // Importa Link
import LikeButton from '@/components/posts/like-button';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentSheet from './comment-sheet';
import PostOptions from './post-options';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import PostImages from './post-images';
import { useSession } from '../providers/session-provider';
import { ComponentProps } from 'react';
import LikesDialog from './likes-dialog';

// Helper function per trasformare gli hashtag in link
function linkifyHashtags(text: string): React.ReactNode[] {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            const tag = part.substring(1);
            return (
                <Link key={index} href={`/hashtags/${tag.toLowerCase()}`} className="text-blue-500 hover:underline">
                    {part}
                </Link>
            );
        }
        return part;
    });
}

interface PostCardProps extends ComponentProps<typeof Card> {
    post: PostWithData;
}

export default function PostCard({ post, ...props }: PostCardProps) {
    const { session } = useSession();
    const currentUserId = session?.user?.id;

    const profile = post.profiles;
    if (!profile) return null;

    const isAuthor = currentUserId === post.user_id;

    const linkedCaption = post.caption ? linkifyHashtags(post.caption) : null;

    return (
        <Card {...props} className="rounded-xl overflow-hidden shadow-sm">
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${profile.username}`}>
                            <Avatar>
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href={`/profile/${profile.username}`} className="font-semibold hover:underline">
                                {profile.username}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
                            </p>
                        </div>
                    </div>
                    {isAuthor && <PostOptions post={post} />}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <PostImages media={post.media} />
            </CardContent>

            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <LikeButton post={post} />
                    <CommentSheet post={post}>
                        <MessageCircle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                    </CommentSheet>
                </div>

                {post.likes.length > 0 && (
                     <LikesDialog postId={post.id}>
                         <span className="text-sm font-semibold hover:underline">
                             {post.likes.length} {post.likes.length === 1 ? 'Mi piace' : 'Mi piace'}
                         </span>
                     </LikesDialog>
                )}
                
                <div className="text-sm">
                    <Link href={`/profile/${profile.username}`} className="font-semibold hover:underline">
                        {profile.username}
                    </Link>
                    <span className="ml-2 whitespace-pre-wrap">{linkedCaption}</span>
                </div>

                <CommentSheet post={post}>
                    <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">
                        {post.comments.length > 0
                            ? `Visualizza tutti i ${post.comments.length} commenti`
                            : 'Aggiungi un commento...'}
                    </p>
                </CommentSheet>
            </div>
        </Card>
    );
} 