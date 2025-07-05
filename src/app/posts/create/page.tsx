import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreatePostForm from '@/components/posts/create-post-form';

export default async function CreatePostPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }
    
    return (
        <div className="container mx-auto max-w-lg p-4">
            <h1 className="text-2xl font-bold mb-6">Crea un nuovo post</h1>
            <CreatePostForm />
        </div>
    );
} 