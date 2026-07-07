import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Owner Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 py-24">
      <Link href="/" className="mb-12 font-display text-xl text-paper">
        Shammaq <span className="italic text-champagne">Bin Faisal</span>
      </Link>

      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>

      <p className="mt-10 text-xs text-smoke">
        Not the owner?{" "}
        <Link href="/" className="text-champagne underline underline-offset-4">
          Return home
        </Link>
      </p>
    </main>
  );
}
