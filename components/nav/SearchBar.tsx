"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, ImageOff } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { PhotoWithCategory } from "@/lib/types";

export function SearchBar({ photos }: { photos: PhotoWithCategory[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? photos
        .filter((photo) =>
          [photo.title, photo.description ?? "", photo.category?.name ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 6)
    : [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search photography"
        className="flex h-10 w-10 items-center justify-center text-paper/80 transition-colors hover:text-champagne"
      >
        {open ? <X size={18} /> : <Search size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-[92vw] max-w-sm border border-champagne/30 bg-ink/95 p-4 shadow-2xl backdrop-blur-md sm:w-96"
          >
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos, categories..."
              className="w-full border-b border-paper/20 bg-transparent pb-2 text-sm text-paper placeholder:text-smoke focus:border-champagne focus:outline-none"
            />

            <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
              {q && results.length === 0 && (
                <p className="flex items-center gap-2 py-4 text-xs text-smoke">
                  <ImageOff size={14} /> No results for &ldquo;{query}&rdquo;
                </p>
              )}

              {results.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/category/${photo.category?.slug ?? ""}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-sm p-2 transition-colors hover:bg-paper/5"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-charcoal">
                    <Image
                      src={photo.cloudinary_url}
                      alt={photo.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-paper">{photo.title}</p>
                    <p className="truncate text-[11px] uppercase tracking-widest2 text-champagne">
                      {photo.category?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
