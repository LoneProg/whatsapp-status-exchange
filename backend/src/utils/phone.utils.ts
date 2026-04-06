/**
 * src/utils/phone.utils.ts
 * Normalises phone numbers to E.164 international format using libphonenumber-js.
 *
 * Examples:
 *   "08012345678"         → "+2348012345678"  (with defaultCountry "NG")
 *   "+1 (555) 867-5309"  → "+15558675309"
 *   "+44 7700 900123"    → "+447700900123"
 */

import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

/**
 * Attempt to parse and normalise a raw phone string.
 *
 * @param raw            - The phone number as entered by the user.
 * @param defaultCountry - ISO 3166-1 alpha-2 country code used when the
 *                         number has no country prefix (default: "NG").
 * @returns Normalised E.164 string, or `null` if the number is invalid.
 */
export function normalisePhone(
  raw: string,
  defaultCountry: CountryCode = "NG"
): string | null {
  const cleaned = raw.trim().replace(/\s+/g, "");

  const parsed = parsePhoneNumberFromString(cleaned, defaultCountry);

  if (!parsed || !parsed.isValid()) {
    return null;
  }

  return parsed.format("E.164"); // e.g. "+2348012345678"
}

/**
 * Validate without normalising.
 */
export function isValidPhone(
  raw: string,
  defaultCountry: CountryCode = "NG"
): boolean {
  return normalisePhone(raw, defaultCountry) !== null;
}
