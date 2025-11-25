/**
 * Utility functions for phone number normalization
 */

/**
 * Normalize Yemeni phone number to international format (+967XXXXXXXXX)
 * Supports formats: 05XXXXXXXX, 5XXXXXXXX, 7XXXXXXXX, +967XXXXXXXXX, 967XXXXXXXXX
 * 
 * @param phone - Phone number in various formats
 * @returns Normalized phone number in format +967XXXXXXXXX (13 characters)
 * @throws Error if phone number format is invalid
 */
export function normalizeYemeniPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');

  // If starts with +967, return as is (already normalized)
  if (normalized.startsWith('+967')) {
    if (normalized.length === 13) {
      return normalized;
    }
    throw new Error(`Invalid phone number length. Expected 13 characters (+967XXXXXXXXX), got ${normalized.length}`);
  }

  // If starts with 967, add +
  if (normalized.startsWith('967')) {
    normalized = '+' + normalized;
    if (normalized.length === 13) {
      return normalized;
    }
    throw new Error(`Invalid phone number length. Expected 13 characters (+967XXXXXXXXX), got ${normalized.length}`);
  }

  // If starts with 00, replace with +
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
    if (normalized.startsWith('+967') && normalized.length === 13) {
      return normalized;
    }
  }

  // Handle local formats: 05XXXXXXXX, 5XXXXXXXX, 7XXXXXXXX
  if (normalized.startsWith('05')) {
    // Remove leading 0
    normalized = normalized.substring(1);
  }

  // Add country code if not present
  if (!normalized.startsWith('+')) {
    normalized = '+967' + normalized;
  }

  // Validate length (should be +967XXXXXXXXX = 13 chars)
  if (normalized.length !== 13) {
    throw new Error(`Invalid phone number length. Expected 13 characters (+967XXXXXXXXX), got ${normalized.length}. Input: ${phone}`);
  }

  // Validate prefix (Yemen mobile operators)
  const validPrefixes = ['+96773', '+96771', '+96770', '+96777', '+96778'];
  const prefix = normalized.substring(0, 6);
  if (!validPrefixes.includes(prefix)) {
    throw new Error(`Invalid phone prefix. Allowed: +96773 (MTN), +96771 (Sabafon), +96770 (Y Telecom), +96777 (Yemen Mobile), +96778. Got: ${prefix}`);
  }

  return normalized;
}

/**
 * Check if phone number is Yemeni format (without validation)
 */
export function isYemeniPhoneFormat(phone: string): boolean {
  try {
    normalizeYemeniPhone(phone);
    return true;
  } catch {
    return false;
  }
}

