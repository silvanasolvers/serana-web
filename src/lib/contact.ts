export const WHATSAPP_NUMBER = '573002500474';
export const WHATSAPP_DISPLAY = '+57 300 250 0474';

export function buildWhatsAppUrl(message?: string) {
  const text = message?.trim();
  return `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
