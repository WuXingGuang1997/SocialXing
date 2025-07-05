'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Grid3x3, Heart } from 'lucide-react';

type ProfileTabsProps = {
  username: string;
};

export default function ProfileTabs({ username }: ProfileTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'posts';

  const activeClasses = 'border-b-2 border-primary text-primary';
  const inactiveClasses = 'text-muted-foreground';

  return (
    <div className="flex justify-center gap-12 border-b">
      <Link
        href={`/profile/${username}`}
        className={cn(
          'flex items-center gap-2 py-3 px-2 text-sm font-medium transition-colors',
          currentTab === 'posts' ? activeClasses : inactiveClasses
        )}
      >
        <Grid3x3 className="h-5 w-5" />
        POST
      </Link>
      <Link
        href={`/profile/${username}?tab=liked`}
        className={cn(
          'flex items-center gap-2 py-3 px-2 text-sm font-medium transition-colors',
          currentTab === 'liked' ? activeClasses : inactiveClasses
        )}
      >
        <Heart className="h-5 w-5" />
        MI PIACE
      </Link>
    </div>
  );
} 