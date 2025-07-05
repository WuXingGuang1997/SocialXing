import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/layout/user-menu";
import { Profile } from "@/types";

export default function Header({ profile }: { profile: Profile | null }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b dark:border-zinc-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                    SocialXing
                </Link>

                {profile ? (
                    <div className="flex items-center gap-4">
                        <Button asChild>
                            <Link href="/posts/create">Crea Post</Link>
                        </Button>
                        <UserMenu profile={profile} />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                         <Button asChild variant="secondary">
                            <Link href="/login">Accedi</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/login?type=register">Registrati</Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
} 