'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PostWithData, CommentWithData } from '@/types';
import CommentList from './comment-list';
import CommentForm from './comment-form';

interface CommentSheetProps {
  post: PostWithData;
  children?: React.ReactNode;
}

export default function CommentSheet({ post, children }: CommentSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<CommentWithData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, post.id]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (!response.ok) {
        throw new Error('Errore nel recupero dei commenti');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error(error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = (newComment: CommentWithData) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };
  
  const handleCommentDeleted = (commentId: string) => {
    setComments(prevComments => {
        const commentsToDelete = new Set<string>([commentId]);
        let changed = true;
        
        while (changed) {
            changed = false;
            const sizeBefore = commentsToDelete.size;

            prevComments.forEach(comment => {
                if (comment.parent_comment_id && commentsToDelete.has(comment.parent_comment_id)) {
                    commentsToDelete.add(comment.id);
                }
            });

            if (commentsToDelete.size > sizeBefore) {
                changed = true;
            }
        }
        
        return prevComments.filter(comment => !commentsToDelete.has(comment.id));
    });
  };

  const handleCommentUpdated = (updatedComment: CommentWithData) => {
    setComments(prevComments => 
      prevComments.map(c => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex flex-col h-full w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        <SheetHeader>
          <SheetTitle>Commenti</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-4 -mr-6">
          {isLoading ? (
            <p className="text-center py-8">Caricamento...</p>
          ) : (
            <CommentList 
              postId={post.id}
              comments={comments} 
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
            />
          )}
        </div>
        <div className="mt-auto p-1 border-t">
          <CommentForm
            postId={post.id}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
} 