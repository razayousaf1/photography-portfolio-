import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-baseline gap-1.5 font-display leading-none"
      aria-label="Shammaq Bin Faisal — Home"
    >
      <span className="text-lg tracking-tight text-white transition-colors group-hover:text-champagne sm:text-xl">
        Shammaq
      </span>
      <span className="text-lg italic tracking-tight text-white transition-colors group-hover:text-champagne sm:text-xl">
        Bin Faisal
      </span>
    </Link>
  );
}
