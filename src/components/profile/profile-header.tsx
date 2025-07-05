'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FollowButton from '@/components/auth/follow-button';
import { Profile } from '@/types';
import FollowsDialog from './follows-dialog';

interface ProfileHeaderProps {
    profile: Profile & { id: string, postsCount: number };
    initialFollowersCount: number;
    initialFollowingCount: number;
    initialIsFollowing: boolean;
}

export default function ProfileHeader({
    profile,
    initialFollowersCount,
    initialFollowingCount,
    initialIsFollowing,
}: ProfileHeaderProps) {

    return (
        <header className="flex items-center space-x-6 mb-10">
            <Avatar className="h-24 w-24 md:h-36 md:w-36">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl">
                    {profile.username?.[0].toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                <div className="flex space-x-6 mt-4 text-lg">
                    <div><span className="font-bold">{profile.postsCount ?? 0}</span> post</div>
                    <FollowsDialog title="Follower" userId={profile.id} type="followers">
                        <div className="cursor-pointer"><span className="font-bold">{initialFollowersCount}</span> follower</div>
                    </FollowsDialog>
                    <FollowsDialog title="Seguiti" userId={profile.id} type="following">
                        <div className="cursor-pointer"><span className="font-bold">{initialFollowingCount}</span> seguiti</div>
                    </FollowsDialog>
                </div>
                <div className="mt-4">
                    <FollowButton
                        profileId={profile.id}
                        initialIsFollowing={initialIsFollowing}
                    />
                </div>
            </div>
        </header>
    );
} 