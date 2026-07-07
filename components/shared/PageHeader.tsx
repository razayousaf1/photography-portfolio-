import { AnimatedSection } from "./AnimatedSection";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-paper/10 pb-14 pt-36 sm:pt-44">
      <AnimatedSection className="mx-auto max-w-4xl px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-paper sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-smoke">
            {description}
          </p>
        )}
      </AnimatedSection>
    </div>
  );
}
