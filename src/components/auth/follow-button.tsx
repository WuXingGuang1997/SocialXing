'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
    profileId: string;
    initialIsFollowing: boolean;
}

export default function FollowButton({ profileId, initialIsFollowing }: FollowButtonProps) {
    const { session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (!session) return router.push('/login');
        
        setIsLoading(true);
        const method = initialIsFollowing ? 'DELETE' : 'POST';

        try {
            const response = await fetch(`/api/users/${profileId}/follow`, { method });
            if (!response.ok) {
                throw new Error('Operazione fallita');
            }
            // Su successo, diciamo a Next.js di ricaricare i dati del server per questa pagina.
            // Questo aggiornerà i conteggi e lo stato del pulsante in modo corretto.
            router.refresh();
        } catch (error) {
            console.error(error);
            // Qui si potrebbe mostrare un messaggio di errore all'utente
        } finally {
            setIsLoading(false);
        }
    };

    if (session?.user?.id === profileId) return null; 

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            variant={initialIsFollowing ? 'secondary' : 'default'}
            className="w-24"
        >
            {isLoading ? '...' : (initialIsFollowing ? 'Segui già' : 'Segui')}
        </Button>
    );
} 