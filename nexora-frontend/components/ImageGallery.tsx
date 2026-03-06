'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const all = images.length > 0 ? images : [];

  const prev = useCallback(() => setActive((i) => (i === 0 ? all.length - 1 : i - 1)), [all.length]);
  const next = useCallback(() => setActive((i) => (i === all.length - 1 ? 0 : i + 1)), [all.length]);

  if (all.length === 0) {
    return (
      <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div className="relative group">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={all[active]}
            alt={`${alt} — image ${active + 1}`}
            fill
            priority={active === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-opacity duration-300"
          />

          {/* Navigation arrows */}
          {all.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom button */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute bottom-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Zoom image"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {active + 1} / {all.length}
          </div>
        </div>

        {/* Dots */}
        {all.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {all.slice(0, 12).map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={clsx('gallery-dot', i === active && 'active')}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {all.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clsx(
                'relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all',
                i === active ? 'border-brand-600 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(false)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl mx-4 aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image
              src={all[active]}
              alt={`${alt} — lightbox`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {all.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
