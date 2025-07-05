'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useSession } from '@/components/providers/session-provider';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import EditCommentForm from './edit-comment-form';
import { CommentWithData } from '@/types';


// Tipo temporaneo per sbloccare la situazione
type CommentWithOptions = any;

interface CommentOptionsProps {
    comment: CommentWithOptions;
    onCommentDeleted: (commentId: string) => void;
    onCommentUpdated: (comment: CommentWithData) => void;
}

export default function CommentOptions({ comment, onCommentDeleted, onCommentUpdated }: CommentOptionsProps) {
    const { session } = useSession();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    
    const isOwner = session?.user?.id === comment.user_id;

    if (!isOwner) {
        return null;
    }

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Errore durante la cancellazione del commento.");
            }
            onCommentDeleted(comment.id); // AGGIORNAMENTO UI ISTANTANEO
        } catch (error) {
            console.error(error);
            // Qui potremmo mostrare un errore e annullare l'update ottimistico
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };
    
    const handleUpdateSuccess = (updatedComment: CommentWithData) => {
        onCommentUpdated(updatedComment); // AGGIORNAMENTO UI ISTANTANEO
        setShowEditDialog(false); // Chiude il dialogo
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                        <span className="sr-only">Apri menu commento</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        Modifica
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                        Elimina
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialog di Modifica */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifica commento</DialogTitle>
                    </DialogHeader>
                    <EditCommentForm 
                        comment={comment} 
                        onSuccess={handleUpdateSuccess} 
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog di Conferma Eliminazione */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro di voler eliminare?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione è irreversibile e cancellerà il tuo commento permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                            className='bg-red-600 hover:bg-red-700'
                        >
                            {isDeleting ? 'Cancellazione...' : 'Sì, elimina'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 