"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X, ArrowUp, ArrowDown, ImageIcon, Layers } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { categoryFormSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


export function CategoryManager({ categories: initial }: { categories: CategorySummary[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

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

  function startEditing(category: CategorySummary) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) return;
    setBusyId(id);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not rename the category.");
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c))
      );
      toast.success("Category renamed.");
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const temp = reordered[index]!;
    reordered[index] = reordered[targetIndex]!;
    reordered[targetIndex] = temp;
    setCategories(reordered);

    try {
      const response = await fetch("/api/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((c) => c.id) }),
      });
      if (!response.ok) throw new Error("Could not save the new order.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed.");
      router.refresh();
    }
  }

  async function handleDelete(category: CategorySummary, force: boolean) {
    setBusyId(category.id);
    try {
      const response = await fetch(`/api/categories/${category.id}?force=${force}`, {
        method: "DELETE",
      });

      if (response.status === 409 && !force) {
        setConfirmingDeleteId(category.id);
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Could not delete the category.");
      }

      toast.success("Category deleted.");
      setConfirmingDeleteId(null);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleCreate} className="border border-burgundy bg-charcoal/40 p-6 rounded-xl">
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
      </form>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-burgundy py-16 text-center text-smoke rounded-xl">
            <Layers size={22} />
            <p className="text-sm">No categories yet — add one above.</p>
          </div>
        ) : (
          categories.map((category, index) => (
            <div key={category.id} className="border border-burgundy bg-charcoal/30 p-4 rounded-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
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
                      disabled={index === categories.length - 1}
                      onClick={() => move(index, 1)}
                      className="text-smoke transition-colors hover:text-champagne disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-burgundy bg-charcoal text-smoke rounded-xl">
                    <ImageIcon size={16} />
                  </div>

                  {editingId === category.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-9 w-48"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(category.id)}
                        className="text-champagne"
                        aria-label="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-smoke"
                        aria-label="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-paper">{category.name}</p>
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                          className="text-smoke transition-colors hover:text-champagne"
                          aria-label="Rename"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-smoke">/category/{category.slug}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={category.photoCount > 0 ? "champagne" : "outline"}>
                    {category.photoCount} photo{category.photoCount === 1 ? "" : "s"}
                  </Badge>
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-xs uppercase tracking-widest2 text-smoke transition-colors hover:text-champagne"
                  >
                    Manage
                  </Link>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    loading={busyId === category.id}
                    onClick={() => handleDelete(category, false)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {confirmingDeleteId === category.id && (
                <div className="mt-4 border border-red-500/40 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">
                    This category still has {category.photoCount} photo
                    {category.photoCount === 1 ? "" : "s"}. Deleting it will permanently
                    delete {category.photoCount === 1 ? "that photo" : "all of them"} too —
                    from Cloudinary and the database. This can&apos;t be undone.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      loading={busyId === category.id}
                      onClick={() => handleDelete(category, true)}
                    >
                      Yes, delete everything
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}