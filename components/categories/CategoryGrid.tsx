import type { CategorySummary } from "@/lib/types";
import { CategoryCard } from "./CategoryCard";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export function CategoryGrid({ categories }: { categories: CategorySummary[] }) {
  return (
    <section id="categories" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <AnimatedSection className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">
              Portfolio
            </p>
            <h2 className="mt-3 font-display text-3xl text-paper sm:text-5xl">
              Five bodies of work.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-smoke">
            Each category is its own discipline — its own light, pace, and
            grammar. Choose one to step inside.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <AnimatedSection key={category.id} delay={index * 0.06}>
              <CategoryCard category={category} index={index} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
