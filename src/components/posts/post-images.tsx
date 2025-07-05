'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Media } from '@/types';
import Image from 'next/image';

interface PostImagesProps {
  media: (Media & { signedUrl: string })[];
}

export default function PostImages({ media }: PostImagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? media.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === media.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <div className="relative aspect-square w-full bg-muted overflow-hidden">
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      <Image
        src={media[currentIndex].signedUrl}
        alt={`Post image ${currentIndex + 1}`}
        fill
        className="object-cover"
        priority={currentIndex === 0}
      />
       {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
          {media.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentIndex === index ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 