import { UploadForm } from "@/components/forms/UploadForm";
import { getCategories } from "@/lib/data";

export default async function AdminUploadPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
          New Upload
        </p>
        <h1 className="mt-2 font-display text-3xl text-paper sm:text-4xl">
          Add a photo
        </h1>
        <p className="mt-2 text-sm text-smoke">
          Uploads go straight to Cloudinary, then get saved to the gallery.
        </p>
      </div>

      <UploadForm categories={categories} />
    </div>
  );
}
