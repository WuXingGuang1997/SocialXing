'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostWithData } from '@/types';
import { useSession } from '@/components/providers/session-provider'; // Creeremo questo provider tra poco

interface LikeButtonProps {
    post: PostWithData;
}

export default function LikeButton({ post }: LikeButtonProps) {
    const router = useRouter();
    const { session } = useSession(); // Otteniamo la sessione corrente

    // Determiniamo lo stato iniziale del like
    const initialLikes = post.likes.length;
    const initialLikedByUser = session
        ? post.likes.some((like) => like.user_id === session.user.id)
        : false;

    const [likes, setLikes] = useState(initialLikes);
    const [likedByUser, setLikedByUser] = useState(initialLikedByUser);

    const handleLike = async () => {
        if (!session) {
            return router.push('/login');
        }

        // Aggiornamento ottimistico dell'UI
        setLikedByUser(!likedByUser);
        setLikes(likedByUser ? likes - 1 : likes + 1);

        const method = likedByUser ? 'DELETE' : 'POST';

        try {
            const response = await fetch(`/api/posts/${post.id}/like`, { method });

            if (!response.ok) {
                // Se la richiesta fallisce, torniamo allo stato precedente
                setLikedByUser(likedByUser);
                setLikes(likes);
                console.error('Errore durante l\'aggiornamento del like');
            }
        } catch (error) {
            // Anche in caso di errore di rete, torniamo indietro
            setLikedByUser(likedByUser);
            setLikes(likes);
            console.error('Errore di rete:', error);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                disabled={!session} // Disabilita se non loggato
            >
                <Heart
                    className={`h-6 w-6 ${likedByUser ? 'text-red-500 fill-current' : 'text-foreground'}`}
                />
                <span className="sr-only">Like</span>
            </Button>
            <span className="font-medium text-sm">{likes} {likes === 1 ? 'like' : 'likes'}</span>
        </div>
    );
} 