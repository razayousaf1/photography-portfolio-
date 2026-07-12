import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategorySummaries } from "@/lib/data";

export default async function AdminCategoriesPage() {
  const categories = await getCategorySummaries();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
          Categories
        </p>
        <h1 className="mt-2 font-display text-3xl text-paper sm:text-4xl">
          Manage categories
        </h1>
        <p className="mt-2 text-sm text-smoke">
          Add new portfolio categories here — they&apos;ll show up immediately in
          the upload form and on the homepage.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}