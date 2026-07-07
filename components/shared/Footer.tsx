import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-paper/10 bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl text-paper">
              Shammaq <span className="italic text-champagne">Bin Faisal</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke">
              Photography shot with intent — fashion, product, corporate, weddings,
              and commercial work, framed for people who notice detail.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-champagne">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm text-paper/80">
              <li><Link href="/about" className="transition-colors hover:text-champagne">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-champagne">Contact Us</Link></li>
              <li><Link href="/book-now" className="transition-colors hover:text-champagne">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-champagne">
              Categories
            </p>
            <ul className="mt-4 space-y-2 text-sm text-paper/80">
              {["Fashion", "Product", "Corporate", "Weddings", "Commercial"].map((c) => (
                <li key={c}>
                  <Link
                    href={`/category/${c.toLowerCase()}`}
                    className="transition-colors hover:text-champagne"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-champagne">
              Get in touch
            </p>
            <ul className="mt-4 space-y-3 text-sm text-paper/80">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-champagne" /> shammaq12@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-champagne" /> +92 321 9135919
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={14} className="text-champagne" /> @shammaqfilms
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-paper/10 pt-6 text-xs text-smoke sm:flex-row sm:items-center">
          <p>© {year} Syed Yousaf Raza. All rights reserved.</p>
          <Link href="/login" className="transition-colors hover:text-champagne">
            Owner Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
