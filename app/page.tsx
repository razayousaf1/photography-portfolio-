import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/hero/Hero";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getCategorySummaries, getPublicPhotos } from "@/lib/data";

export default async function HomePage() {
  const [categories, photos] = await Promise.all([
    getCategorySummaries(),
    getPublicPhotos(),
  ]);

  return (
    <>
      <Navbar photos={photos} />
      <main>
        <Hero />
        <CategoryGrid categories={categories} />

        <section className="border-t border-paper/10 bg-charcoal/30 py-24">
          <AnimatedSection className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
              Working With Shammaq
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-paper sm:text-4xl">
              &ldquo;Every frame should hold up in silence — no caption
              needed.&rdquo;
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-smoke">
              From concept calls to final delivery, every shoot is planned
              around light, story, and the one image that will outlast the
              rest.
            </p>
          </AnimatedSection>
        </section>
      </main>
      <Footer />
    </>
  );
}
