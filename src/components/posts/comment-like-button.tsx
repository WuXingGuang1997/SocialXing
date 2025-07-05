'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Comment } from '@/types';
import { useSession } from '@/components/providers/session-provider';

interface CommentLikeButtonProps {
    comment: Comment;
}

export default function CommentLikeButton({ comment }: CommentLikeButtonProps) {
    const router = useRouter();
    const { session } = useSession();

    const initialLikes = comment.comment_likes.length;
    const initialLikedByUser = session
        ? comment.comment_likes.some((like) => like.user_id === session.user.id)
        : false;

    const [likes, setLikes] = useState(initialLikes);
    const [likedByUser, setLikedByUser] = useState(initialLikedByUser);

    const handleLike = async () => {
        if (!session) {
            return router.push('/login');
        }

        // Aggiornamento ottimistico
        setLikedByUser(!likedByUser);
        setLikes(likedByUser ? likes - 1 : likes + 1);

        const method = likedByUser ? 'DELETE' : 'POST';

        try {
            const response = await fetch(`/api/comments/${comment.id}/like`, { method });

            if (!response.ok) {
                // Rollback in caso di errore
                setLikedByUser(likedByUser);
                setLikes(likes);
            }
        } catch (error) {
            // Rollback in caso di errore
            setLikedByUser(likedByUser);
            setLikes(likes);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleLike}
                disabled={!session}
            >
                <Heart
                    className={`h-4 w-4 ${likedByUser ? 'text-red-500 fill-current' : 'text-muted-foreground'}`}
                />
                <span className="sr-only">Like</span>
            </Button>
            <span className="text-xs font-medium text-muted-foreground">{likes > 0 ? likes : ''}</span>
        </div>
    );
} 