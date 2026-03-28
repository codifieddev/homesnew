"use client";

import { useState } from "react";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface MediaAsset {
  url: string;
  type: string;
  caption?: string;
  isCover?: boolean;
  order?: number;
}

interface PropertyGalleryProps {
  images: MediaAsset[];
  projectName: string;
}

export function PropertyGallery({ images, projectName }: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const sorted = [...images].sort((a, b) => {
    if (a.isCover) return -1;
    if (b.isCover) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const cover = sorted[0];
  const thumbs = sorted.slice(1, 5);
  const hasMore = sorted.length > 5;

  const prev = () => setLightboxIndex((i) => i === null ? null : i === 0 ? sorted.length - 1 : i - 1);
  const next = () => setLightboxIndex((i) => i === null ? null : i === sorted.length - 1 ? 0 : i + 1);

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px] rounded-2xl overflow-hidden">
        {/* Cover — spans 2 cols + 2 rows */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => setLightboxIndex(0)}
        >
          <Image
            src={cover.url}
            alt={`${projectName} — Cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Thumbnails */}
        {thumbs.map((img, i) => (
          <div
            key={i}
            className="relative cursor-pointer group"
            onClick={() => setLightboxIndex(i + 1)}
          >
            <Image
              src={img.url}
              alt={`${projectName} — ${i + 2}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {/* "View all" overlay on last thumb */}
            {i === 3 && hasMore && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <p className="text-white text-sm font-semibold">+{sorted.length - 5} more</p>
              </div>
            )}
          </div>
        ))}

        {/* Fill empty slots if < 5 thumbs */}
        {Array.from({ length: Math.max(0, 4 - thumbs.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-muted" />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white bg-white/10 rounded-full transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white bg-white/10 rounded-full transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-4xl max-h-[85vh] mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={sorted[lightboxIndex].url}
              alt={sorted[lightboxIndex].caption ?? `${projectName} — ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[85vh] rounded-xl"
              unoptimized
            />
            <p className="text-center text-white/40 text-sm mt-3">
              {lightboxIndex + 1} / {sorted.length}
              {sorted[lightboxIndex].caption && ` · ${sorted[lightboxIndex].caption}`}
            </p>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white bg-white/10 rounded-full transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}
