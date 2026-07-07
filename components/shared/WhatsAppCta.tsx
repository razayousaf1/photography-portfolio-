import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppCtaProps {
  message: string;
  heading: string;
  description: string;
  buttonLabel?: string;
}

export function WhatsAppCta({
  message,
  heading,
  description,
  buttonLabel = "Chat on WhatsApp",
}: WhatsAppCtaProps) {
  return (
    <div className="border border-champagne/30 bg-champagne/5 p-8 text-center sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-champagne/40 text-champagne">
        <MessageCircle size={24} />
      </span>
      <h3 className="mt-6 font-display text-2xl text-paper">{heading}</h3>
      <p className="mt-3 text-sm leading-relaxed text-smoke">{description}</p>
      <a
        href={buildWhatsAppLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center gap-2 border border-champagne bg-champagne px-8 py-4 font-mono text-xs uppercase tracking-widest2 text-ink transition-colors hover:bg-champagne-light"
        >
        <MessageCircle size={16} />
        {buttonLabel}
      </a>
    </div>
  );
}