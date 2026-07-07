"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { PhotoWithCategory } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

export function PhotoCard({
  photo,
  onClick,
  priority = false,
}: {
  photo: PhotoWithCategory;
  onClick?: () => void;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden border border-paper/10 bg-charcoal text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={optimizedImageUrl(photo.cloudinary_url, { width: 900 })}
          alt={photo.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 ease-cinematic group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

        {photo.is_featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 border border-champagne/60 bg-ink/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest2 text-champagne">
            <Star size={10} className="fill-champagne" /> Featured
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="font-display text-lg text-paper">{photo.title}</p>
        </div>
      </div>
    </button>
  );
}
