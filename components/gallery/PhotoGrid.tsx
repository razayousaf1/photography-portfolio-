"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { PhotoWithCategory } from "@/lib/types";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export function PhotoGrid({ photos }: { photos: PhotoWithCategory[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-smoke">
        <ImageOff size={28} />
        <p className="font-display text-lg text-paper">No photos here yet</p>
        <p className="max-w-xs text-sm">
          This category is being prepared. Check back soon, or browse another
          body of work.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <AnimatedSection key={photo.id} delay={Math.min(index, 6) * 0.05}>
            <PhotoCard
              photo={photo}
              priority={index < 3}
              onClick={() => setActiveIndex(index)}
            />
          </AnimatedSection>
        ))}
      </div>

      <Lightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
