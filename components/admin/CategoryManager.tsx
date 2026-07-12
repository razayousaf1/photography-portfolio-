"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ImageIcon, Layers } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { categoryFormSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CategoryManager({ categories }: { categories: CategorySummary[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = categoryFormSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid category name.");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not create the category.");
      }

      toast.success(`"${result.data.name}" added.`);
      setName("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create the category.";
      setError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(category: CategorySummary) {
    const confirmed = window.confirm(`Delete the "${category.name}" category?`);
    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not delete the category.");
      }
      toast.success("Category deleted.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleCreate} className="border border-paper/10 bg-charcoal/40 p-6">
        <Label htmlFor="category-name">Add a new category</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Behind the Scenes"
            className="sm:flex-1"
          />
          <Button type="submit" variant="champagne" size="md" loading={creating}>
            <Plus size={16} />
            Add Category
          </Button>
        </div>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        <p className="mt-3 text-xs text-smoke">
          The page URL is generated automatically from the name (e.g. &ldquo;Behind
          the Scenes&rdquo; → <code>/category/behind-the-scenes</code>).
        </p>
      </form>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-paper/10 py-16 text-center text-smoke">
            <Layers size={22} />
            <p className="text-sm">No categories yet — add one above.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-4 border border-paper/10 bg-charcoal/30 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-paper/10 bg-charcoal text-smoke">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <p className="text-paper">{category.name}</p>
                  <p className="text-xs text-smoke">/category/{category.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={category.photoCount > 0 ? "champagne" : "outline"}>
                  {category.photoCount} photo{category.photoCount === 1 ? "" : "s"}
                </Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  loading={deletingId === category.id}
                  disabled={category.photoCount > 0}
                  onClick={() => handleDelete(category)}
                  title={
                    category.photoCount > 0
                      ? "Move or delete its photos first"
                      : "Delete this category"
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}