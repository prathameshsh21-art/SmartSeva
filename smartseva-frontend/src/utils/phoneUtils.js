/**
 * SmartSeva Phone Number Normalization & Deep Link Utilities
 */

/**
 * Normalizes phone number for device-native SMS apps (E.164 format with leading +).
 * E.g. "8050653488" -> "+918050653488"
 */
export function normalizeForSms(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  if (!cleaned) return null;

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return '+91' + cleaned;
  }

  // 12 digits starting with 91
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return '+' + cleaned;
  }

  // 11 digits starting with 0
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return '+91' + cleaned.substring(1);
  }

  return '+' + cleaned;
}

/**
 * Normalizes phone number for WhatsApp wa.me links (digits only, NO leading +).
 * E.g. "8050653488" -> "918050653488"
 * E.g. "+918050653488" -> "918050653488"
 */
export function normalizeForWhatsApp(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.trim().replace(/[\s\-()+]/g, '');
  if (!cleaned) return null;

  // 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return '91' + cleaned;
  }

  // 12 digits starting with 91
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  // 11 digits starting with 0
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return '91' + cleaned.substring(1);
  }

  return cleaned;
}

/**
 * Generates an sms: URI deep link.
 */
export function createSmsLink(phone, message = '') {
  const norm = normalizeForSms(phone);
  if (!norm) return null;
  const encodedBody = encodeURIComponent(message || '');
  return `sms:${norm}?body=${encodedBody}`;
}

/**
 * Generates a wa.me WhatsApp deep link.
 */
export function createWhatsAppLink(phone, message = '') {
  const norm = normalizeForWhatsApp(phone);
  if (!norm) return null;
  const encodedText = encodeURIComponent(message || '');
  return `https://wa.me/${norm}?text=${encodedText}`;
}

/**
 * Opens the native SMS composer on the user's device.
 */
export function openSmsComposer(phone, message = '') {
  const link = createSmsLink(phone, message);
  if (!link) return false;
  try {
    const a = document.createElement('a');
    a.href = link;
    a.target = '_self';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Failed to trigger sms: link', err);
    window.location.href = link;
    return true;
  }
}

/**
 * Opens WhatsApp or WhatsApp Web in a new tab.
 */
export function openWhatsApp(phone, message = '') {
  const link = createWhatsAppLink(phone, message);
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
}
