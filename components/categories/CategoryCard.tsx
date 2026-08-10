"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
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

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [9, -9]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-11, 11]), springConfig);
  const scale = useSpring(1, springConfig);

  const glareX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(199,125,116,0.35), transparent 60%)`;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseEnter() {
    scale.set(1.03);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
    scale.set(1);
  }

  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, scale, transformPerspective: 900 }}
        className="group-hover:champagne-glow relative aspect-[4/5] overflow-hidden rounded-xl border-2 border-burgundy bg-charcoal transition-shadow duration-500"
      >
        <motion.div
          aria-hidden="true"
          style={{ background: glareBackground }}
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="pointer-events-none absolute inset-0 z-10 border-2 border-transparent transition-colors duration-500 group-hover:border-champagne/70 rounded-xl" />

        {category.coverImage ? (
          <Image
            src={optimizedImageUrl(category.coverImage, { width: 900 })}
            alt={`${category.name} portfolio cover`}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-cinematic group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-charcoal">
            <ImageIcon className="text-smoke" size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/95" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-champagne">
              {String(index + 1).padStart(2, "0")} · {category.photoCount} photos
            </p>
            <h3 className="mt-1 font-display text-2xl text-paper sm:text-3xl">
              {category.name}
            </h3>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="mt-2 font-mono text-[10px] uppercase tracking-widest2 text-champagne opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              View Collection →
            </motion.p>
          </div>
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-paper/30 text-paper transition-all duration-300 group-hover:rotate-45 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}