import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryPhotoManager } from "@/components/admin/CategoryPhotoManager";
import { getCategories, getPhotosForCategoryAdmin } from "@/lib/data";

interface Props {
  params: { id: string };
}

export default async function AdminCategoryDetailPage({ params }: Props) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === params.id);

  if (!category) notFound();

  const photos = await getPhotosForCategoryAdmin(category.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest2 text-smoke transition-colors hover:text-champagne"
        >
          <ArrowLeft size={14} />
          Back to Categories
        </Link>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest2 text-champagne">
          Manage Photos
        </p>
        <h1 className="mt-2 font-display text-3xl text-paper sm:text-4xl">{category.name}</h1>
        <p className="mt-2 text-sm text-smoke">
          Choose the cover photo and arrange the order photos appear in on the public page.
        </p>
      </div>

      <CategoryPhotoManager category={category} photos={photos} />
    </div>
  );
}