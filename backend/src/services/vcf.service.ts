/**
 * src/services/vcf.service.ts
 * Builds a vCard 3.0 compliant .vcf file from a list of contacts.
 *
 * Reference: RFC 2426 — vCard MIME Directory Profile
 */

import { ContactRecord } from "./contact.service";

/**
 * Escape special characters that vCard 3.0 requires to be escaped.
 * (commas, semicolons, backslashes, newlines)
 */
function escapeVcfValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Build a single vCard block for one contact.
 *
 * BEGIN:VCARD
 * VERSION:3.0
 * FN:Full Name
 * TEL;TYPE=CELL:+2348012345678
 * END:VCARD
 */
function buildVCard(contact: ContactRecord): string {
  const name = escapeVcfValue(contact.name.trim());
  const phone = contact.phone.trim();

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `TEL;TYPE=CELL:${phone}`,
    "END:VCARD",
  ].join("\r\n"); // RFC mandates CRLF
}

/**
 * Generate a complete .vcf file string from an array of contacts.
 * Each vCard is separated by a blank line for maximum compatibility.
 */
export function generateVcf(contacts: ContactRecord[]): string {
  if (contacts.length === 0) {
    return "";
  }

  return contacts.map(buildVCard).join("\r\n\r\n") + "\r\n";
}
