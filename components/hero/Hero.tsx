"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const LensScene = dynamic(
  () => import("./LensScene").then((mod) => mod.LensScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 animate-pulse rounded-full border border-champagne/20" />
      </div>
    ),
  }
);

export function Hero() {
  return (
    <section className="relative flex h-[100vh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 bg-champagne-radial opacity-60" />
      <LensScene />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs uppercase tracking-widest2 text-champagne"
        >
          Fashion · Product · Corporate · Weddings · Commercial
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-display text-5xl leading-[1.02] text-paper sm:text-7xl lg:text-8xl"
        >
          Shot with
          <br />
          <span className="italic text-champagne">intent.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg text-balance text-base leading-relaxed text-smoke sm:text-lg"
        >
          Shammaq Bin Faisal is a photographer working between Lahore and the
          rest of the world — building images that hold their nerve.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/book-now"
            className="border border-champagne bg-champagne px-8 py-4 font-mono text-xs uppercase tracking-widest2 text-ink transition-colors hover:bg-champagne-light"
          >
            Book a Session
          </Link>
          <Link
            href="#categories"
            className="border border-paper/30 px-8 py-4 font-mono text-xs uppercase tracking-widest2 text-paper transition-colors hover:border-champagne hover:text-champagne"
          >
            View Portfolio
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
