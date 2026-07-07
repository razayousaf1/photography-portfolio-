"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UploadCloud, LogOut, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/upload", label: "Upload Photo", icon: UploadCloud },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-paper/10 bg-charcoal/40 p-6">
      <div>
        <p className="font-display text-lg text-paper">
          Owner <span className="text-champagne">Studio</span>
        </p>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Admin">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-l-2 border-champagne bg-champagne/10 text-champagne"
                    : "border-l-2 border-transparent text-paper/80 hover:text-champagne"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-paper/80 transition-colors hover:text-champagne"
        >
          <ExternalLink size={16} />
          View Live Site
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 text-left text-sm text-paper/80 transition-colors hover:text-red-400"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
