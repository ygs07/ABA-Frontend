/**
 * Formats an ISO date string to a localized string in the Africa/Lagos timezone.
 * Format: DD MMM YYYY (e.g., 14 Oct 2023)
 */
export function formatDate(isoDate: string | Date): string {
  if (!isoDate) return '';
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;

  return new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Formats an ISO date string with time.
 * Format: DD MMM YYYY, HH:mm
 */
export function formatDateTime(isoDate: string | Date): string {
  if (!isoDate) return '';
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;

  return new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace(',', '');
}

/**
 * Normalizes a Nigerian phone number to +234 format.
 * Examples: 
 * 0803 000 0000 -> +2348030000000
 * +234 803 000 0000 -> +2348030000000
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('234')) {
    return '+' + digits;
  }
  if (digits.startsWith('0')) {
    return '+234' + digits.substring(1);
  }
  return '+' + digits;
}

/**
 * Formats a phone number for display.
 * +2348030000000 -> +234 803 000 0000
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith('+234') && normalized.length === 14) {
    return `+234 ${normalized.substring(4, 7)} ${normalized.substring(7, 10)} ${normalized.substring(10)}`;
  }
  return phone;
}

/**
 * Formats an amount in kobo (minor units) to NGN (major units).
 */
export function formatMoney(amountInKobo: number): string {
  const amount = amountInKobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getAmountFontSize(amountInKobo: number): string {
  const absNaira = Math.abs(amountInKobo) / 100;
  if (absNaira >= 100_000_000) return 'text-base sm:text-lg xl:text-xl';
  if (absNaira >= 10_000_000) return 'text-lg sm:text-xl xl:text-2xl';
  if (absNaira >= 1_000_000) return 'text-xl sm:text-2xl xl:text-2xl';
  return 'text-2xl sm:text-3xl';
}
