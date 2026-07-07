import type { Metadata } from "next";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { WhatsAppCta } from "@/components/shared/WhatsAppCta";
import { getPublicPhotos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Shammaq Bin Faisal for shoots, collaborations, and questions.",
};

const DETAILS = [
  { icon: Mail, label: "Email", value: "shammaq12@gmail.com" },
  { icon: Phone, label: "Phone", value: "+92 321 9135919" },
  { icon: MapPin, label: "Studio", value: "Lahore, Pakistan" },
  { icon: Instagram, label: "Instagram", value: "@shammaqfilms" },
];

export default async function ContactPage() {
  const photos = await getPublicPhotos();

  return (
    <>
      <Navbar photos={photos} />
      <main>
        <PageHeader
          eyebrow="Contact"
          title="Say hello."
          description="Questions about a project, a collaboration, or just curious about the work — this is the fastest way to reach the studio."
        />

        <section className="mx-auto grid max-w-6xl gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <AnimatedSection>
            <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
              Reach the studio
            </p>
            <ul className="mt-6 space-y-6">
              {DETAILS.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-champagne/30 text-champagne">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-smoke">{label}</p>
                    <p className="mt-1 text-paper">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-sm text-sm leading-relaxed text-smoke">
              Looking to book a session instead? Head to the{" "}
              <a href="/book-now" className="text-champagne underline underline-offset-4">
                Book Now
              </a>{" "}
              page for a dedicated inquiry form.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <WhatsAppCta
              heading="Message us on WhatsApp"
              description="The fastest way to reach the studio — send your question and we'll reply directly on WhatsApp."
              message="Hi Shammaq! I'd like to get in touch."
            />
          </AnimatedSection>
        </section>
      </main>
      <Footer />
    </>
  );
}