import type { Metadata } from "next";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { WhatsAppCta } from "@/components/shared/WhatsAppCta";
import { getPublicPhotos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Book Now",
  description: "Book a photography session with Shammaq Bin Faisal — fashion, product, corporate, weddings, and commercial.",
};

const STEPS = [
  { title: "Send an inquiry", detail: "Share your date, shoot type, and vision." },
  { title: "Confirm the brief", detail: "A short call to lock in location, mood, and deliverables." },
  { title: "Shoot day", detail: "On-site direction, lighting, and pacing handled end to end." },
  { title: "Delivery", detail: "Culled, edited gallery delivered on an agreed timeline." },
];

export default async function BookNowPage() {
  const photos = await getPublicPhotos();

  return (
    <>
      <Navbar photos={photos} />
      <main>
        <PageHeader
          eyebrow="Book Now"
          title="Start your project."
          description="Message us on WhatsApp with your date, shoot type, and a few details — we'll follow up to confirm availability."
        />

        <section className="mx-auto grid max-w-6xl gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <AnimatedSection>
            <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
              How it works
            </p>
            <ol className="mt-6 space-y-8">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-display text-2xl text-champagne">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-paper">{step.title}</p>
                    <p className="mt-1 text-sm text-smoke">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <WhatsAppCta
              heading="Book your session on WhatsApp"
              description="Share your date, shoot type, and vision — we'll confirm availability directly in the chat."
              message="Hi Shammaq! I'd like to book a photography session. Here are my details:"
              buttonLabel="Book on WhatsApp"
            />
          </AnimatedSection>
        </section>
      </main>
      <Footer />
    </>
  );
}