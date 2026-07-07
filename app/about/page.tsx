import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getPublicPhotos } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Shammaq Bin Faisal's approach to photography — biography, creative statement, and the discipline behind the work.",
};

export default async function AboutPage() {
  const photos = await getPublicPhotos();

  return (
    <>
      <Navbar photos={photos} />
      <main>
        <PageHeader
          eyebrow="About"
          title="Photography that holds its nerve."
          description="Shammaq Bin Faisal builds images that stay quiet under pressure — composed, deliberate, and built to outlast the moment they were shot in."
        />

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <AnimatedSection>
              <div className="relative aspect-[4/5] overflow-hidden border border-paper/10 bg-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1200&q=80"
                  alt="Shammaq Bin Faisal at work behind the camera"
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15} className="flex flex-col gap-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
                  Biography
                </p>
                <p className="mt-4 text-base leading-relaxed text-paper/90">
                  Shammaq Bin Faisal is a photographer based between Lahore
                  and the wider region, working across fashion, product,
                  corporate, wedding, and commercial photography. Over the
                  past several years, that range has become the point — the
                  same discipline of light and composition applied to a
                  runway, a boardroom, or a wedding aisle.
                </p>
                <p className="mt-4 text-base leading-relaxed text-paper/90">
                  Every project starts the same way: understand what the
                  image needs to do before deciding how it should look.
                  That question shapes everything downstream — the lens, the
                  light, the pace of the day.
                </p>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
                  Creative Statement
                </p>
                <p className="mt-4 text-base leading-relaxed text-paper/90">
                  Restraint is a tool, not a limitation. A frame with one
                  clear idea, shot with intent, will always outlast a frame
                  crowded with three. That belief drives a 95% black-and-white
                  sensibility across the portfolio — letting texture, gesture,
                  and light carry the story, with color used only when it
                  earns its place.
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-6 border-t border-paper/10 pt-8 sm:grid-cols-3">
                {[
                  ["120+", "Projects Delivered"],
                  ["5", "Specializations"],
                  ["8+", "Years Behind the Lens"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-3xl text-champagne">{value}</dt>
                    <dd className="mt-1 text-xs uppercase tracking-wide text-smoke">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
