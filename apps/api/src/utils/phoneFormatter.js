/**
 * phoneFormatter.js
 * Standardized Phone Formatting & Normalization (Aashray Unified Standard)
 */

/**
 * Normalizes any phone string to a domestic 10-digit number for Indian numbers,
 * or clean digits for international numbers.
 * @param {string|number} mobno - Raw phone number input
 * @returns {string} Clean 10-digit or trimmed phone string
 */
export function cleanDomesticPhone(mobno) {
  if (mobno === null || mobno === undefined || mobno === '') return '';
  const digits = String(mobno).replace(/\D/g, '');
  if (digits.length > 10) {
    // If it starts with 91 and has 12 digits (India), strip the 91
    if (digits.startsWith('91') && digits.length === 12) {
      return digits.slice(2);
    }
    // If it starts with 0 and has 11 digits, strip the 0
    if (digits.startsWith('0') && digits.length === 11) {
      return digits.slice(1);
    }
    // Default: take last 10 digits
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Formats a phone number for WhatsApp API delivery or international storage.
 * Directly synced from Aashray's backend/utils/phoneFormatter.js.
 * @param {string|number} mobno - The raw mobile number.
 * @param {string} [country] - The country name associated with the number.
 * @returns {string|null} The formatted phone number with country code.
 */
export function formatWhatsAppPhone(mobno, country) {
  if (mobno === null || mobno === undefined || mobno === '') return null;

  // Clean all non-digit characters
  let cleanPhone = String(mobno).replace(/\D/g, '');
  const countryStr = country ? String(country).trim().toLowerCase() : '';

  // Handle India (default fallback)
  if (!countryStr || countryStr === 'india') {
    if (cleanPhone.length === 10) {
      return `91${cleanPhone}`;
    }
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return cleanPhone;
    }
    return cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  }

  // Country code mappings
  const COUNTRY_CODES = {
    'united states': '1',
    'united states of america': '1',
    'usa': '1',
    'united arab emirates': '971',
    'uae': '971',
    'dubai': '971',
    'united kingdom': '44',
    'uk': '44',
    'germany': '49',
    'canada': '1',
    'egypt': '20',
    'australia': '61',
    'singapore': '65',
    'new zealand': '64',
    'kenya': '254',
    'south africa': '27',
  };

  const code = COUNTRY_CODES[countryStr];
  if (code) {
    if (code === '971' && cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = cleanPhone.substring(1);
    }
    if (cleanPhone.startsWith(code)) {
      return cleanPhone;
    }
    return `${code}${cleanPhone}`;
  }

  if (cleanPhone.length > 10) {
    return cleanPhone;
  }
  return `91${cleanPhone}`;
}
