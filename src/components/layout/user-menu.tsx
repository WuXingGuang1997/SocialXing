'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import SignOutButton from './sign-out-button';
import { Profile } from '@/types';
import { DoorClosed, Heart, Settings } from 'lucide-react';

export default function UserMenu({ profile }: { profile: Profile }) {
    if (!profile) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>{profile.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/profile/${profile.username}`}>
                    <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Profilo
                    </DropdownMenuItem>
                </Link>
                 <Link href="/liked">
                    <DropdownMenuItem>
                        <Heart className="w-4 h-4 mr-2" />
                        Post piaciuti
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 