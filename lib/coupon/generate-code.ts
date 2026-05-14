// lib/coupon/generate-code.ts
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // omits 0,O,1,I,L

export function generateCouponCode(): string {
  let body = "";
  for (let i = 0; i < 6; i++) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `PR${body}`;
}
