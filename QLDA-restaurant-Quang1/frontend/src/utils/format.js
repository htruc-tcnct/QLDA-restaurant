/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} locale - The locale to use (default: 'vi-VN')
 * @param {string} currency - The currency to use (default: 'VND')
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (value, locale = 'vi-VN', currency = 'VND') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a date as a string
 * @param {Date|string} date - The date to format
 * @param {string} locale - The locale to use (default: 'vi-VN')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, locale = 'vi-VN') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date and time as a string
 * @param {Date|string} date - The date to format
 * @param {string} locale - The locale to use (default: 'vi-VN')
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date, locale = 'vi-VN') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 