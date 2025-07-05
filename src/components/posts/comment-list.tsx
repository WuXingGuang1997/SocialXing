'use client';

import { CommentWithData } from '@/types';
import CommentOptions from './comment-options';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import CommentForm from './comment-form';
import CommentLikeButton from './comment-like-button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useSession } from '../providers/session-provider';

interface CommentListProps {
    comments: CommentWithData[];
    postId: string;
    onCommentAdded: (comment: CommentWithData) => void;
    onCommentDeleted: (commentId: string) => void;
    onCommentUpdated: (comment: CommentWithData) => void;
}

// Funzione per costruire l'albero dei commenti
const buildCommentTree = (comments: CommentWithData[]): CommentWithData[] => {
    const commentsById: { [key: string]: CommentWithData & { replies?: CommentWithData[] } } = {};
    comments.forEach(comment => {
        commentsById[comment.id] = { ...comment, replies: [] };
    });

    const rootComments: CommentWithData[] = [];
    comments.forEach(comment => {
        if (comment.parent_comment_id && commentsById[comment.parent_comment_id]) {
            commentsById[comment.parent_comment_id].replies?.push(commentsById[comment.id]);
        } else {
            rootComments.push(commentsById[comment.id]);
        }
    });

    return rootComments;
};


// Componente per un singolo commento (potenzialmente ricorsivo)
const CommentItem = ({ 
    comment, 
    postId,
    onCommentAdded,
    onCommentDeleted, 
    onCommentUpdated,
    onReply,
    isReplying,
    activeReplyId
}: { 
    comment: CommentWithData, 
    postId: string;
    onCommentAdded: (comment: CommentWithData) => void;
    onCommentDeleted: (commentId: string) => void;
    onCommentUpdated: (comment: CommentWithData) => void;
    onReply: (commentId: string) => void;
    isReplying: boolean;
    activeReplyId: string | null;
}) => {
    const { session } = useSession();
    const isEdited = comment.updated_at && new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 5000;
    const canReply = !!session?.user;

    return (
        <li className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles?.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm">
                        <Link href={`/profile/${comment.profiles?.username}`} className="font-semibold hover:underline">
                            {comment.profiles?.username}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
                        </span>
                        {isEdited && <span className="ml-2 text-xs text-gray-500">(modificato)</span>}
                    </p>
                    <CommentOptions
                        comment={comment}
                        onCommentDeleted={onCommentDeleted}
                        onCommentUpdated={onCommentUpdated}
                    />
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2">
                    <CommentLikeButton comment={comment} />
                    {canReply && (
                        <button onClick={() => onReply(comment.id)} className="text-xs font-semibold text-muted-foreground hover:text-primary">
                            Rispondi
                        </button>
                    )}
                </div>

                {isReplying && activeReplyId === comment.id && (
                    <div className="mt-4">
                        <CommentForm 
                            postId={postId} 
                            parentCommentId={comment.id} 
                            onCommentAdded={(newComment) => {
                                onCommentAdded(newComment);
                                onReply(''); // Chiude il form dopo l'invio
                            }}
                            placeholder={`Rispondi a ${comment.profiles?.username}...`}
                        />
                    </div>
                )}
                
                {(comment.replies && comment.replies.length > 0) && (
                     <ul className="mt-4 pl-6 border-l">
                        {comment.replies.map((reply: CommentWithData) => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                postId={postId}
                                onCommentAdded={onCommentAdded}
                                onCommentDeleted={onCommentDeleted}
                                onCommentUpdated={onCommentUpdated}
                                onReply={onReply}
                                isReplying={isReplying}
                                activeReplyId={activeReplyId}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </li>
    );
};


export default function CommentList({ comments, postId, onCommentAdded, onCommentDeleted, onCommentUpdated }: CommentListProps) {
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

    const handleReplyClick = (commentId: string) => {
        setActiveReplyId(prev => prev === commentId ? null : commentId);
    };

    if (!comments || comments.length === 0) {
        return <p className="text-sm text-muted-foreground">Nessun commento. Inizia tu la conversazione!</p>;
    }

    const commentTree = buildCommentTree(comments);

    return (
        <ul className="space-y-4">
            {commentTree.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onCommentAdded={onCommentAdded}
                    onCommentDeleted={onCommentDeleted}
                    onCommentUpdated={onCommentUpdated}
                    onReply={handleReplyClick}
                    isReplying={activeReplyId !== null}
                    activeReplyId={activeReplyId}
                />
            ))}
        </ul>
    );
} 