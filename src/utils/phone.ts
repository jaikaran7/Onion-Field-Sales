export function normalizeMobile(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}

export function telLink(mobile: string) {
  return `tel:+91${mobile}`;
}

export function whatsappLink(mobile: string) {
  return `https://wa.me/91${mobile}`;
}
