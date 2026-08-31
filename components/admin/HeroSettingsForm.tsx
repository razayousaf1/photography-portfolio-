"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { HeroSettings } from "@/lib/types";
import { optimizedImageUrl } from "@/lib/cloudinary";

export function HeroSettingsForm({ settings }: { settings: HeroSettings }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(settings.heroImageUrl);
  const [opacity, setOpacity] = useState(settings.heroOpacity);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFileChange(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setPendingFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    try {
      let finalUrl = imageUrl;
      let finalPublicId: string | null = null;

      if (pendingFile) {
        const signResponse = await fetch("/api/cloudinary-sign", { method: "POST" });
        if (!signResponse.ok) throw new Error("Could not prepare the upload.");
        const signPayload = await signResponse.json();

        const cloudinaryForm = new FormData();
        cloudinaryForm.append("file", pendingFile);
        cloudinaryForm.append("api_key", signPayload.apiKey);
        cloudinaryForm.append("timestamp", String(signPayload.timestamp));
        cloudinaryForm.append("signature", signPayload.signature);
        cloudinaryForm.append("folder", signPayload.folder);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signPayload.cloudName}/image/upload`,
          { method: "POST", body: cloudinaryForm }
        );
        if (!cloudinaryResponse.ok) throw new Error("Cloudinary rejected the upload.");
        const cloudinaryData = await cloudinaryResponse.json();

        finalUrl = cloudinaryData.secure_url;
        finalPublicId = cloudinaryData.public_id;
      }

      const response = await fetch("/api/settings/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroImageUrl: finalUrl,
          ...(finalPublicId ? { heroImagePublicId: finalPublicId } : {}),
          heroOpacity: opacity,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not save the settings.");
      }

      setImageUrl(finalUrl);
      setPendingFile(null);
      toast.success("Homepage background updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageUrl: null }),
      });
      if (!response.ok) throw new Error("Could not remove the background.");
      setImageUrl(null);
      setPendingFile(null);
      setPreview(null);
      toast.success("Background removed — back to the default look.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the background.");
    } finally {
      setSaving(false);
    }
  }

  const displaySrc = preview ?? (imageUrl ? optimizedImageUrl(imageUrl, { width: 1200 }) : null);

  return (
    <div className="space-y-8">
      <div>
        <Label>Background photo</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-burgundy bg-charcoal/40 hover:border-champagne"
        >
          {displaySrc ? (
            <>
              <Image src={displaySrc} alt="Homepage background preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-ink" style={{ opacity: 1 - opacity / 100 }} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-smoke">
              <UploadCloud className="text-champagne" size={28} />
              <p className="text-sm">Click to choose a background photo</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="opacity">Photo opacity</Label>
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
          Lower opacity fades the photo into the background so the headline text stays
          easy to read. Preview updates above as you drag.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="champagne" size="md" loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
        {imageUrl && (
          <Button type="button" variant="destructive" size="md" onClick={handleRemove} disabled={saving}>
            <Trash2 size={14} />
            Remove Background
          </Button>
        )}
      </div>
    </div>
  );
}