'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Profile } from '@/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface LikesDialogProps {
  postId: string;
  children: React.ReactNode;
  triggerClassName?: string;
}

export default function LikesDialog({ postId, children, triggerClassName }: LikesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [likers, setLikers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLikers = async () => {
    if (likers.length > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/likes`);
      if (!response.ok) throw new Error('Failed to fetch likers');
      
      const data: Profile[] = await response.json();
      setLikers(data.filter(p => p)); // Filtra eventuali profili null
    } catch (error) {
      console.error(error);
      setLikers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchLikers();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={cn("cursor-pointer", triggerClassName)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Persone a cui piace</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <p className="text-center py-4">Caricamento...</p>
          ) : likers.length > 0 ? (
            <ul className="space-y-4">
              {likers.map((profile) => (
                <li key={profile.id} className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${profile.username}`} onClick={() => setIsOpen(false)} className="font-semibold hover:underline">
                      {profile.username}
                    </Link>
                    {profile.full_name && <p className="text-sm text-muted-foreground">{profile.full_name}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-4">Nessun &quot;mi piace&quot; ancora.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 