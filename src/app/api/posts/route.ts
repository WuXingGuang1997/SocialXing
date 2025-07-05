import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const isValidFileType = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
};
const MAX_FILE_SIZE_MB = 25;

// Funzione helper per estrarre gli hashtag (es. #testo -> testo)
const parseHashtags = (text: string): string[] => {
    if (!text) return [];
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (!matches) {
        return [];
    }
    // Rimuove il '#' e restituisce un array di hashtag unici e in minuscolo
    return [...new Set(matches.map(h => h.substring(1).toLowerCase()))];
};

export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const formData = await request.formData();
    const mediaFile = formData.get('media') as File | null;
    const caption = formData.get('caption') as string | null;

    if (!mediaFile && !caption) {
        return NextResponse.json({ error: 'È richiesto un contenuto o un file per il post.' }, { status: 400 });
    }

    // 1. Inserisci il post
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({ user_id: user.id, caption: caption })
        .select()
        .single();

    if (postError) {
        console.error("Errore nell'inserimento del post:", postError);
        return NextResponse.json({ error: "Impossibile creare il post" }, { status: 500 });
    }

    const newPostId = post.id;

    // 2. Gestione Hashtag
    const hashtags = parseHashtags(caption || '');
    if (hashtags.length > 0) {
        const { data: hashtagData, error: hashtagError } = await supabase
            .from('hashtags')
            .upsert(
                hashtags.map(name => ({ name })),
                { onConflict: 'name', ignoreDuplicates: false }
            )
            .select('id');

        if (hashtagError) {
            console.error('Errore nel salvataggio degli hashtag:', hashtagError);
        } else if (hashtagData) {
            const postHashtagLinks = hashtagData.map((h: {id: number}) => ({
                post_id: newPostId,
                hashtag_id: h.id,
            }));
            const { error: linkError } = await supabase.from('post_hashtags').insert(postHashtagLinks);
            if (linkError) {
                console.error('Errore nel collegamento post-hashtag:', linkError);
            }
        }
    }

    // 3. Gestione Media (se presente)
    if (mediaFile) {
        if (!isValidFileType(mediaFile) || mediaFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            console.warn("File non valido o troppo grande, post creato senza immagine.");
        } else {
            const fileExtension = mediaFile.name.split('.').pop();
            const filePath = `${user.id}/${newPostId}-${uuidv4()}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage.from('media').upload(filePath, mediaFile);

            if (uploadError) {
                console.error("Errore nell'upload del file:", uploadError);
            } else {
                const { error: mediaError } = await supabase.from('media').insert({
                    user_id: user.id,
                    post_id: newPostId,
                    file_path: filePath,
                    mime_type: mediaFile.type,
                });

                if (mediaError) {
                    console.error("Errore nell'inserimento dei metadati:", mediaError);
                }
            }
        }
    }

    revalidatePath('/');
    revalidatePath('/hashtags');

    return NextResponse.json({ message: 'Post creato con successo' }, { status: 201 });
} 