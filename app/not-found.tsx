import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest2 text-champagne">404</p>
      <h1 className="mt-4 font-display text-4xl text-paper sm:text-5xl">
        This frame doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-sm text-sm text-smoke">
        The page you&apos;re looking for has moved, or never existed. Let&apos;s
        get you back to the portfolio.
      </p>
      <Link
        href="/"
        className="mt-8 border border-champagne px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-champagne transition-colors hover:bg-champagne hover:text-ink"
      >
        Back to Home
      </Link>
    </main>
  );
}
