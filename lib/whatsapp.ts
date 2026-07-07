/**
 * Builds a WhatsApp "click to chat" link (wa.me). No API key, no Meta
 * Business verification, no cost — it just opens WhatsApp with a
 * pre-filled message.
 */

export function getWhatsAppNumber(): string {
    const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
    return raw.replace(/[^0-9]/g, "");
  }
  
  export function isWhatsAppConfigured(): boolean {
    return getWhatsAppNumber().length >= 8;
  }
  
  export function buildWhatsAppLink(message: string): string {
    const number = getWhatsAppNumber();
    const text = encodeURIComponent(message);
    return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
  }