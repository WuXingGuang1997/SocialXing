'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostWithData } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditPostFormProps {
    post: PostWithData;
    onPostUpdated: () => void;
}

export default function EditPostForm({ post, onPostUpdated }: EditPostFormProps) {
    const router = useRouter();
    const [caption, setCaption] = useState(post.caption || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caption }),
            });

            if (!response.ok) {
                throw new Error("Impossibile aggiornare il post");
            }

            onPostUpdated(); // Chiude il dialogo
            router.refresh(); // Aggiorna i dati della pagina

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="caption" className="sr-only">Didascalia</Label>
                <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Scrivi una nuova didascalia..."
                    className="min-h-[120px]"
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
        </form>
    );
} 