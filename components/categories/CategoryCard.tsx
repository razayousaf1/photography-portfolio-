"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

export function CategoryCard({
  category,
  index,
}: {
  category: CategorySummary;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setStyle({
      transform: `perspective(900px) rotateX(${y * -10}deg) rotateY(${x * 12}deg) scale3d(1.02, 1.02, 1.02)`,
    });
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    });
  }

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className="tilt-card group-hover:champagne-glow relative aspect-[4/5] overflow-hidden rounded-xl border-2 border-burgundy bg-charcoal transition-shadow duration-500"
      >
        <div className="pointer-events-none absolute inset-0 z-10 border border-transparent transition-colors duration-500 group-hover:border-champagne/70" />

        {category.coverImage ? (
          <Image
            src={optimizedImageUrl(category.coverImage, { width: 900 })}
            alt={`${category.name} portfolio cover`}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-cinematic group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-charcoal">
            <ImageIcon className="text-smoke" size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-champagne">
              {String(index + 1).padStart(2, "0")} · {category.photoCount} photos
            </p>
            <h3 className="mt-1 font-display text-2xl text-paper sm:text-3xl">
              {category.name}
            </h3>
          </div>
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-paper/30 text-paper transition-all duration-300 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
