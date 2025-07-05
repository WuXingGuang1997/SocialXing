'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreatePostForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Per favore, seleziona un file.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Qualcosa è andato storto');
      }

      router.push('/');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="media-file">Immagine o Video</Label>
        <Input
          id="media-file"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          required
          className="file:text-foreground"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="caption">Didascalia</Label>
        <Textarea
          id="caption"
          placeholder="Scrivi qualcosa..."
          value={caption}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Caricamento in corso...' : 'Crea Post'}
      </Button>
    </form>
  );
} 