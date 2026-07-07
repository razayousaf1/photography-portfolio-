"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Star, EyeOff, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PhotoWithCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { optimizedImageUrl } from "@/lib/cloudinary";

export function PhotoTable({ photos }: { photos: PhotoWithCategory[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(photo: PhotoWithCategory) {
    const confirmed = window.confirm(
      `Delete "${photo.title}"? This also removes it from Cloudinary and cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(photo.id);
    try {
      const response = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not delete photo.");
      }
      toast.success("Photo deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 border border-paper/10 py-20 text-center text-smoke">
        <ImageOff size={24} />
        <p className="text-sm">No photos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-paper/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-paper/10 bg-charcoal/60 font-mono text-[11px] uppercase tracking-widest2 text-smoke">
          <tr>
            <th className="px-4 py-3">Photo</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {photos.map((photo) => (
            <tr key={photo.id} className="border-b border-paper/5 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-charcoal">
                    <Image
                      src={optimizedImageUrl(photo.cloudinary_url, { width: 96 })}
                      alt={photo.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-paper">{photo.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-paper/80">{photo.category?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {photo.is_featured && (
                    <Badge variant="champagne">
                      <Star size={10} className="mr-1 fill-champagne" /> Featured
                    </Badge>
                  )}
                  {!photo.is_public && (
                    <Badge variant="outline">
                      <EyeOff size={10} className="mr-1" /> Hidden
                    </Badge>
                  )}
                  {photo.is_public && !photo.is_featured && <Badge>Public</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-paper/60">{formatDate(photo.created_at)}</td>
              <td className="px-4 py-3 text-right">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  loading={deletingId === photo.id}
                  onClick={() => handleDelete(photo)}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
