import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { StatsCards } from "@/components/admin/StatsCards";
import { PhotoTable } from "@/components/admin/PhotoTable";
import { Button } from "@/components/ui/button";
import { getAllPhotosForAdmin } from "@/lib/data";

export default async function AdminDashboardPage() {
  const photos = await getAllPhotosForAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl text-paper sm:text-4xl">
            All photos & categories
          </h1>
        </div>
        <Link href="/admin/upload">
          <Button variant="champagne" size="md">
            <UploadCloud size={16} />
            Upload Photo
          </Button>
        </Link>
      </div>

      <StatsCards photos={photos} />

      <div>
        <h2 className="mb-4 font-display text-xl text-paper">Recent Uploads</h2>
        <PhotoTable photos={photos} />
      </div>
    </div>
  );
}
