import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { getCategories, getPhotosByCategorySlug, getPublicPhotos } from "@/lib/data";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await getPhotosByCategorySlug(params.slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Photography`,
    description: `Browse ${category.name.toLowerCase()} photography by Shammaq Bin Faisal.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [{ category, photos }, allPhotos] = await Promise.all([
    getPhotosByCategorySlug(params.slug),
    getPublicPhotos(),
  ]);

  if (!category) notFound();

  return (
    <>
      <Navbar photos={allPhotos} />
      <main>
        <PageHeader
          eyebrow={`Portfolio · ${photos.length} photo${photos.length === 1 ? "" : "s"}`}
          title={category.name}
        />
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <PhotoGrid photos={photos} />
        </section>
      </main>
      <Footer />
    </>
  );
}
