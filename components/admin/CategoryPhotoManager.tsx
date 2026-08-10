"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, ArrowUp, ArrowDown, ImageOff } from "lucide-react";
import type { Category, PhotoWithCategory } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

interface CategoryPhotoManagerProps {
  category: Category;
  photos: PhotoWithCategory[];
}

export function CategoryPhotoManager({ category, photos: initial }: CategoryPhotoManagerProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initial);
  const [coverId, setCoverId] = useState(category.cover_photo_id);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setCover(photoId: string) {
    setBusyId(photoId);
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhotoId: photoId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not set the cover photo.");
      }
      setCoverId(photoId);
      toast.success("Cover photo updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set the cover photo.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    const temp = reordered[index]!;
    reordered[index] = reordered[targetIndex]!;
    reordered[targetIndex] = temp;
    setPhotos(reordered);

    try {
      const response = await fetch("/api/photos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          orderedIds: reordered.map((p) => p.id),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Could not save the new order (status ${response.status}).`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed.");
      router.refresh();
    }
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 border border-burgundy py-16 text-center text-smoke rounded-xl">
        <ImageOff size={22} />
        <p className="text-sm">No photos in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="flex items-center gap-4 border border-burgundy bg-charcoal/30 p-3 rounded-xl"
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              className="text-smoke transition-colors hover:text-champagne disabled:opacity-20"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              disabled={index === photos.length - 1}
              onClick={() => move(index, 1)}
              className="text-smoke transition-colors hover:text-champagne disabled:opacity-20"
              aria-label="Move down"
            >
              <ArrowDown size={14} />
            </button>
          </div>

          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-charcoal">
            <Image
              src={optimizedImageUrl(photo.cloudinary_url, { width: 128 })}
              alt={photo.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <p className="text-sm text-paper">{photo.title}</p>
            {coverId === photo.id && (
              <p className="text-[11px] uppercase tracking-widest2 text-champagne">
                Current cover
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={busyId === photo.id || coverId === photo.id}
            onClick={() => setCover(photo.id)}
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest2 text-smoke transition-colors hover:text-champagne disabled:cursor-default disabled:text-champagne"
          >
            <Star size={14} className={coverId === photo.id ? "fill-champagne text-champagne" : ""} />
            {coverId === photo.id ? "Cover" : "Set as Cover"}
          </button>
        </div>
      ))}
    </div>
  );
}