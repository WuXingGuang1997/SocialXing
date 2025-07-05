'use client';

import { useState } from 'react';
import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (newComment: any) => void;
  parentCommentId?: string;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({ postId, onCommentAdded, parentCommentId, onCancel, placeholder }: CommentFormProps) {
  const { session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || !session) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parent_comment_id: parentCommentId }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'invio del commento');
      }

      const newComment = await response.json();
      onCommentAdded(newComment); // Passa il nuovo commento al genitore
      setContent(''); // Pulisce il form

    } catch (error) {
      console.error(error);
      // Qui potremmo mostrare un toast di errore
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null; // Non mostrare il form se l'utente non è loggato

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-4 p-4 border-t">
      <Avatar className="h-9 w-9">
        <AvatarImage src={session.user.user_metadata.avatar_url} />
        <AvatarFallback>
          {session.user.email?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder={placeholder || "Aggiungi un commento..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={parentCommentId ? 2 : 1}
          className="min-h-[40px] resize-none"
        />
        <div className="flex justify-end mt-2 space-x-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annulla
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Invio...' : 'Invia'}
          </Button>
        </div>
      </div>
    </form>
  );
} 