"use client";

import { useState, type DragEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, GripVertical, ImageOff } from "lucide-react";
import type { Category, PhotoWithCategory } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

interface CategoryPhotoManagerProps {
  category: Category;
  photos: PhotoWithCategory[];
}

function swapItems<T>(list: T[], indexA: number, indexB: number): T[] {
  const updated = [...list];
  const temp = updated[indexA];
  updated[indexA] = updated[indexB] as T;
  updated[indexB] = temp as T;
  return updated;
}

export function CategoryPhotoManager({ category, photos: initial }: CategoryPhotoManagerProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initial);
  const [coverId, setCoverId] = useState(category.cover_photo_id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

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

  async function persistOrder(ordered: PhotoWithCategory[]) {
    setSavingOrder(true);
    try {
      const response = await fetch("/api/photos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          orderedIds: ordered.map((p) => p.id),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Could not save the new order (status ${response.status}).`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed.");
      router.refresh();
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDragStart(e: DragEvent<HTMLDivElement>, photoId: string) {
    setDraggedId(photoId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, photoId: string) {
    e.preventDefault();
    if (draggedId && draggedId !== photoId) {
      setDragOverId(photoId);
    }
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, targetId: string) {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const fromIndex = photos.findIndex((p) => p.id === draggedId);
    const toIndex = photos.findIndex((p) => p.id === targetId);
    setDraggedId(null);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = swapItems(photos, fromIndex, toIndex);
    setPhotos(reordered);
    persistOrder(reordered);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
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
      <p className="text-xs text-smoke">
        Drag any photo by the handle and drop it where you want it — the order
        saves automatically.
        {savingOrder && <span className="ml-2 text-champagne">Saving…</span>}
      </p>

      {photos.map((photo) => (
        <div
          key={photo.id}
          draggable
          onDragStart={(e) => handleDragStart(e, photo.id)}
          onDragOver={(e) => handleDragOver(e, photo.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, photo.id)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-4 rounded-xl border bg-charcoal/30 p-3 transition-all ${
            draggedId === photo.id
              ? "opacity-40"
              : dragOverId === photo.id
                ? "border-champagne bg-champagne/10"
                : "border-burgundy"
          }`}
        >
          <div className="cursor-grab text-smoke active:cursor-grabbing" aria-label="Drag to reorder">
            <GripVertical size={18} />
          </div>

          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-charcoal">
            <Image
              src={optimizedImageUrl(photo.cloudinary_url, { width: 128 })}
              alt={photo.title}
              fill
              className="pointer-events-none object-cover"
              draggable={false}
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