import { HeroSettingsForm } from "@/components/admin/HeroSettingsForm";
import { getHeroSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const settings = await getHeroSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
          Site Settings
        </p>
        <h1 className="mt-2 font-display text-3xl text-paper sm:text-4xl">
          Homepage background
        </h1>
        <p className="mt-2 text-sm text-smoke">
          Upload a photo to replace the default background behind the homepage
          headline, and control how visible it is.
        </p>
      </div>

      <HeroSettingsForm settings={settings} />
    </div>
  );
}