"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">Error</p>
      <h1 className="mt-4 font-display text-4xl text-paper sm:text-5xl">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-sm text-sm text-smoke">
        That&apos;s on us, not you. Try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="border border-champagne bg-champagne px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-ink transition-colors hover:bg-champagne-light"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-paper/30 px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-paper transition-colors hover:border-champagne hover:text-champagne"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
