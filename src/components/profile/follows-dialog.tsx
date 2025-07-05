'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/types';

interface FollowsDialogProps {
  children: React.ReactNode;
  title: string;
  userId: string;
  type: 'followers' | 'following';
}

function UserListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
}

export default function FollowsDialog({ children, title, userId, type }: FollowsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    if (profiles.length > 0) return; // Non ricaricare se già presenti

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/${type}`);
      const data = await response.json();
      if (response.ok) {
        setProfiles(data);
      } else {
        console.error('Errore nel fetch degli utenti:', data.error);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchUsers();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-96 overflow-y-auto">
            {isLoading ? (
                <UserListSkeleton />
            ) : profiles.length > 0 ? (
                <ul className="space-y-4">
                    {profiles.map((profile) => (
                        <li key={profile.id}>
                            <Link href={`/profile/${profile.username}`} className="flex items-center space-x-4 hover:bg-muted p-2 rounded-md" onClick={() => setIsOpen(false)}>
                                <Avatar>
                                    <AvatarImage src={profile.avatar_url || undefined} />
                                    <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{profile.username}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-center">Nessun utente da mostrare.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 