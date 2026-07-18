"use client";

import { useRef, useState, type FormEvent, type DragEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, ImageOff, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UploadFormProps {
  categories: Category[];
}

type FileStatus = "pending" | "uploading" | "saving" | "done" | "error";

interface QueuedFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  status: FileStatus;
  error?: string;
}

function titleFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^/.]+$/, "");
  const spaced = withoutExtension.replace(/[-_]+/g, " ").trim();
  return spaced.replace(/\w\S*/g, (word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase());
}

export function UploadForm({ categories }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;

    const newItems: QueuedFile[] = incoming.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      title: titleFromFilename(file.name),
      status: "pending",
    }));

    setQueue((prev) => [...prev, ...newItems]);
    setError(null);
  }

  function removeFile(id: string) {
    setQueue((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  function updateTitle(id: string, title: string) {
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, title } : f)));
  }

  function updateStatus(id: string, status: FileStatus, error?: string) {
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, status, error } : f)));
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  async function uploadOne(item: QueuedFile): Promise<boolean> {
    try {
      updateStatus(item.id, "uploading");

      const signResponse = await fetch("/api/cloudinary-sign", { method: "POST" });
      if (!signResponse.ok) throw new Error("Could not prepare the upload.");
      const signPayload = await signResponse.json();

      const cloudinaryForm = new FormData();
      cloudinaryForm.append("file", item.file);
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

      updateStatus(item.id, "saving");
      const saveResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
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

      updateStatus(item.id, "done");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      updateStatus(item.id, "error", message);
      return false;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (queue.length === 0) {
      setError("Choose at least one photo to upload.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (queue.some((f) => !f.title.trim())) {
      setError("Every photo needs a title.");
      return;
    }

    setSubmitting(true);

    let successCount = 0;
    // Uploaded sequentially — simpler to track progress per file and avoids
    // hammering Cloudinary/Supabase with a burst of simultaneous requests.
    for (const item of queue) {
      if (item.status === "done") {
        successCount++;
        continue;
      }
      const ok = await uploadOne(item);
      if (ok) successCount++;
    }

    setSubmitting(false);

    if (successCount === queue.length) {
      toast.success(`${successCount} photo${successCount === 1 ? "" : "s"} uploaded.`);
      queue.forEach((f) => URL.revokeObjectURL(f.preview));
      setQueue([]);
      setDescription("");
      setIsFeatured(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push("/admin");
      router.refresh();
    } else if (successCount > 0) {
      toast.warning(`${successCount} of ${queue.length} uploaded. Fix the failed ones and retry.`);
      router.refresh();
    } else {
      toast.error("None of the photos uploaded. Check the errors below.");
    }
  }

  const isBusy = submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div>
        <Label>Photos</Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={`flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-champagne bg-champagne/10"
              : "border-paper/25 bg-charcoal/40 hover:border-champagne"
          }`}
        >
          <UploadCloud className="text-champagne" size={28} />
          <p className="text-sm text-smoke">
            {isDragging
              ? "Drop your photos here"
              : "Drag and drop multiple images, or click to choose"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {queue.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-smoke">
            {queue.length} photo{queue.length === 1 ? "" : "s"} selected
          </p>
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-paper/10 bg-charcoal/30 p-3"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden bg-charcoal">
                <Image src={item.preview} alt={item.title} fill className="object-cover" />
              </div>

              <Input
                value={item.title}
                onChange={(e) => updateTitle(item.id, e.target.value)}
                placeholder="Photo title"
                disabled={item.status !== "pending" && item.status !== "error"}
                className="flex-1"
              />

              <div className="flex w-24 flex-shrink-0 items-center justify-end gap-2">
                {item.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    aria-label="Remove"
                    className="text-smoke transition-colors hover:text-red-400"
                  >
                    <X size={18} />
                  </button>
                )}
                {(item.status === "uploading" || item.status === "saving") && (
                  <Loader2 size={18} className="animate-spin text-champagne" />
                )}
                {item.status === "done" && <CheckCircle2 size={18} className="text-champagne" />}
                {item.status === "error" && (
                  <span title={item.error}>
                    <XCircle size={18} className="text-red-400" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category (applies to all selected photos)</Label>
          {categories.length === 0 ? (
            <p className="flex items-center gap-2 pt-3 text-sm text-smoke">
              <ImageOff size={14} /> No categories yet — add one first.
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
        <Label htmlFor="description">Description (optional, applies to all)</Label>
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
          Mark all as featured
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
        {isBusy
          ? "Uploading..."
          : `Upload ${queue.length || ""} Photo${queue.length === 1 ? "" : "s"}`.trim()}
      </Button>
    </form>
  );
}