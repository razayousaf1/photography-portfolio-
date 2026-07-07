import { ImageIcon, Star, Layers, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PhotoWithCategory } from "@/lib/types";

export function StatsCards({ photos }: { photos: PhotoWithCategory[] }) {
  const total = photos.length;
  const featured = photos.filter((p) => p.is_featured).length;
  const privateCount = photos.filter((p) => !p.is_public).length;
  const categoryCount = new Set(photos.map((p) => p.category_id)).size;

  const stats = [
    { label: "Total Photos", value: total, icon: ImageIcon },
    { label: "Featured", value: featured, icon: Star },
    { label: "Categories in Use", value: categoryCount, icon: Layers },
    { label: "Hidden from Public", value: privateCount, icon: EyeOff },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest2 text-smoke">
                {label}
              </p>
              <p className="mt-2 font-display text-3xl text-paper">{value}</p>
            </div>
            <Icon className="text-champagne" size={22} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
