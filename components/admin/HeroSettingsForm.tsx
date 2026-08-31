"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { HeroSettings } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const signResponse = await fetch("/api/cloudinary-sign", { method: "POST" });
  if (!signResponse.ok) throw new Error("Could not prepare the upload.");
  const signPayload = await signResponse.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signPayload.apiKey);
  form.append("timestamp", String(signPayload.timestamp));
  form.append("signature", signPayload.signature);
  form.append("folder", signPayload.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signPayload.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error("Cloudinary rejected the upload.");
  const data = await response.json();
  return { url: data.secure_url, publicId: data.public_id };
}

export function HeroSettingsForm({ settings }: { settings: HeroSettings }) {
  const router = useRouter();
  const staticInputRef = useRef<HTMLInputElement>(null);
  const slideshowInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"static" | "slideshow">(settings.heroMode);
  const [imageUrl, setImageUrl] = useState(settings.heroImageUrl);
  const [images, setImages] = useState(settings.heroImages);
  const [opacity, setOpacity] = useState(settings.heroOpacity);
  const [staticPreview, setStaticPreview] = useState<string | null>(null);
  const [pendingStaticFile, setPendingStaticFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [isDraggingStatic, setIsDraggingStatic] = useState(false);
  const [isDraggingSlideshow, setIsDraggingSlideshow] = useState(false);

  function handleStaticFileChange(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setPendingStaticFile(file);
    if (staticPreview) URL.revokeObjectURL(staticPreview);
    setStaticPreview(URL.createObjectURL(file));
  }

  function handleStaticDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingStatic(true);
  }
  function handleStaticDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingStatic(false);
  }
  function handleStaticDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingStatic(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleStaticFileChange(dropped);
  }

  async function handleAddSlideshowFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadingSlide(true);
    try {
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith("image/")) continue;
        const { url, publicId } = await uploadToCloudinary(file);
        const response = await fetch("/api/settings/hero-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, publicId }),
        });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(
            errorBody?.error ?? `Could not save one of the images (status ${response.status}).`
          );
        }
        const body = await response.json();
        setImages((prev) => [...prev, { id: body.data.id, url, sortOrder: prev.length }]);
      }
      toast.success("Slideshow photo(s) added.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingSlide(false);
    }
  }

  function handleSlideshowDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingSlideshow(true);
  }
  function handleSlideshowDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingSlideshow(false);
  }
  function handleSlideshowDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingSlideshow(false);
    if (e.dataTransfer.files?.length) handleAddSlideshowFiles(e.dataTransfer.files);
  }

  async function removeSlideshowImage(id: string) {
    try {
      const response = await fetch(`/api/settings/hero-images/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not remove that photo.");
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Photo removed from the slideshow.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let finalUrl = imageUrl;
      let finalPublicId: string | null = null;

      if (mode === "static" && pendingStaticFile) {
        const uploaded = await uploadToCloudinary(pendingStaticFile);
        finalUrl = uploaded.url;
        finalPublicId = uploaded.publicId;
      }

      const response = await fetch("/api/settings/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroMode: mode,
          heroOpacity: opacity,
          ...(mode === "static" ? { heroImageUrl: finalUrl } : {}),
          ...(finalPublicId ? { heroImagePublicId: finalPublicId } : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not save the settings.");
      }

      setImageUrl(finalUrl);
      setPendingStaticFile(null);
      toast.success("Homepage background updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveStatic() {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageUrl: null }),
      });
      if (!response.ok) throw new Error("Could not remove the background.");
      setImageUrl(null);
      setPendingStaticFile(null);
      setStaticPreview(null);
      toast.success("Background removed — back to the default look.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the background.");
    } finally {
      setSaving(false);
    }
  }

  const staticDisplaySrc =
    staticPreview ?? (imageUrl ? optimizedImageUrl(imageUrl, { width: 1200 }) : null);

  return (
    <div className="space-y-8">
      <div>
        <Label>Background type</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("static")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm transition-colors ${
              mode === "static"
                ? "border-champagne bg-champagne/10 text-champagne"
                : "border-burgundy text-paper/70 hover:border-champagne"
            }`}
          >
            Static Photo
          </button>
          <button
            type="button"
            onClick={() => setMode("slideshow")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm transition-colors ${
              mode === "slideshow"
                ? "border-champagne bg-champagne/10 text-champagne"
                : "border-burgundy text-paper/70 hover:border-champagne"
            }`}
          >
            Auto-Rotating Slideshow
          </button>
        </div>
      </div>

      {mode === "static" ? (
        <div>
          <Label>Background photo</Label>
          <div
            onClick={() => staticInputRef.current?.click()}
            onDragOver={handleStaticDragOver}
            onDragLeave={handleStaticDragLeave}
            onDrop={handleStaticDrop}
            role="button"
            tabIndex={0}
            className={`relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
              isDraggingStatic
                ? "border-champagne bg-champagne/10"
                : "border-burgundy bg-charcoal/40 hover:border-champagne"
            }`}
          >
            {staticDisplaySrc ? (
              <Image src={staticDisplaySrc} alt="Background preview" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-smoke">
                <UploadCloud className="text-champagne" size={28} />
                <p className="text-sm">
                  {isDraggingStatic ? "Drop the photo here" : "Drag and drop, or click to choose"}
                </p>
              </div>
            )}
          </div>
          <input
            ref={staticInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleStaticFileChange(e.target.files?.[0] ?? null)}
          />
          {imageUrl && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={handleRemoveStatic}
              disabled={saving}
            >
              <Trash2 size={14} />
              Remove Background
            </Button>
          )}
        </div>
      ) : (
        <div>
          <Label>Slideshow photos (rotates every 3 seconds)</Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-burgundy">
                <Image
                  src={optimizedImageUrl(img.url, { width: 300 })}
                  alt="Slideshow photo"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeSlideshowImage(img.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <div
              onClick={() => slideshowInputRef.current?.click()}
              onDragOver={handleSlideshowDragOver}
              onDragLeave={handleSlideshowDragLeave}
              onDrop={handleSlideshowDrop}
              role="button"
              tabIndex={0}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors ${
                isDraggingSlideshow
                  ? "border-champagne bg-champagne/10 text-champagne"
                  : "border-burgundy text-smoke hover:border-champagne"
              } ${uploadingSlide ? "pointer-events-none opacity-50" : ""}`}
            >
              <UploadCloud size={20} />
              <span className="text-[10px] uppercase tracking-widest2">
                {isDraggingSlideshow ? "Drop here" : "Add"}
              </span>
            </div>
          </div>
          <input
            ref={slideshowInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleAddSlideshowFiles(e.target.files)}
          />
          <p className="mt-3 text-xs text-smoke">
            Drag and drop multiple photos at once, or click to choose — they rotate
            automatically on the homepage in the order added.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="opacity">Photo opacity (applies to all photos)</Label>
          <span className="font-mono text-xs text-champagne">{opacity}%</span>
        </div>
        <input
          id="opacity"
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="w-full accent-champagne"
        />
        <p className="mt-2 text-xs text-smoke">
          Lower opacity fades the photo(s) into the background so the headline text
          stays easy to read. Applies whether you&apos;re using a static photo or the
          slideshow.
        </p>
      </div>

      <Button type="button" variant="champagne" size="md" loading={saving} onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
}