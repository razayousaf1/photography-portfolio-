"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, ImageOff } from "lucide-react";
import type { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UploadFormProps {
  categories: Category[];
}

export function UploadForm({ categories }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [step, setStep] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(selected: File | null) {
    setFile(selected);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose a photo to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Give this photo a title.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }

    try {
      setStep("uploading");

      // 1. Get a short-lived signed payload from our server (keeps the
      //    Cloudinary API secret off the client).
      const signResponse = await fetch("/api/cloudinary-sign", { method: "POST" });
      if (!signResponse.ok) throw new Error("Could not prepare the upload.");
      const signPayload = await signResponse.json();

      // 2. Upload the file directly to Cloudinary from the browser.
      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", file);
      cloudinaryForm.append("api_key", signPayload.apiKey);
      cloudinaryForm.append("timestamp", String(signPayload.timestamp));
      cloudinaryForm.append("signature", signPayload.signature);
      cloudinaryForm.append("folder", signPayload.folder);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signPayload.cloudName}/image/upload`,
        { method: "POST", body: cloudinaryForm }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("Cloudinary rejected the upload. Check your credentials.");
      }

      const cloudinaryData = await cloudinaryResponse.json();

      // 3. Save the resulting URL + metadata to Supabase via our API route.
      setStep("saving");
      const saveResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          isFeatured,
          isPublic,
          cloudinaryUrl: cloudinaryData.secure_url,
          cloudinaryPublicId: cloudinaryData.public_id,
        }),
      });

      if (!saveResponse.ok) {
        const body = await saveResponse.json().catch(() => null);
        throw new Error(body?.error ?? "Could not save the photo.");
      }

      toast.success("Photo uploaded and saved.");
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setIsFeatured(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setStep("idle");
    }
  }

  const isBusy = step !== "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div>
        <Label>Photo</Label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-paper/25 bg-charcoal/40 transition-colors hover:border-champagne"
        >
          {preview ? (
            <div className="relative h-full w-full">
              <Image src={preview} alt="Selected preview" fill className="object-contain p-2" />
            </div>
          ) : (
            <>
              <UploadCloud className="text-champagne" size={28} />
              <p className="text-sm text-smoke">Click to choose an image</p>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Champagne Light"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          {categories.length === 0 ? (
            <p className="flex items-center gap-2 pt-3 text-sm text-smoke">
              <ImageOff size={14} /> No categories yet — add one in Supabase first.
            </p>
          ) : (
            <Select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short note about the shoot, lighting, or context."
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <label className="flex items-center gap-3 text-sm text-paper">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 accent-champagne"
          />
          Mark as featured
        </label>
        <label className="flex items-center gap-3 text-sm text-paper">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 accent-champagne"
          />
          Visible to the public
        </label>
      </div>

      {error && (
        <div role="alert" className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <Button type="submit" variant="champagne" size="lg" loading={isBusy} className="w-full sm:w-auto">
        {step === "uploading" && "Uploading to Cloudinary..."}
        {step === "saving" && "Saving photo..."}
        {step === "idle" && "Upload Photo"}
      </Button>
    </form>
  );
}
