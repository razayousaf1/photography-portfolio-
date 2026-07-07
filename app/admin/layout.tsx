import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ink">
      <div className="hidden w-64 flex-shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <AdminSidebar />
        </div>
      </div>
      <div className="flex-1">
        <div className="border-b border-paper/10 bg-charcoal/30 px-5 py-4 lg:hidden">
          <AdminSidebar />
        </div>
        <main className="px-5 py-10 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
