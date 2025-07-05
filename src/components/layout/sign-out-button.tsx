'use client';

import { createSupabaseClientComponentClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
    const router = useRouter();
    const supabase = createSupabaseClientComponentClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <Button variant="ghost" className="w-full justify-start p-0" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Esci
        </Button>
    );
}
