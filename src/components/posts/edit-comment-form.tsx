'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CommentWithData } from '@/types';

// Usiamo 'any' temporaneamente come in CommentOptions per evitare problemi di tipo
type CommentToEdit = any;

interface EditCommentFormProps {
    comment: CommentToEdit;
    onSuccess: (updatedComment: CommentWithData) => void;
}

export default function EditCommentForm({ comment, onSuccess }: EditCommentFormProps) {
    const [content, setContent] = useState(comment.content || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (content.trim() === '') {
            setError('Il commento non può essere vuoto.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error("Impossibile aggiornare il commento");
            }

            const updatedComment = await response.json();
            onSuccess(updatedComment); // Chiama la callback con il commento aggiornato

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="content" className="sr-only">Commento</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Modifica il tuo commento..."
                    className="min-h-[100px]"
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
        </form>
    );
} 