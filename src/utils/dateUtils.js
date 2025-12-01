// Date utility functions for EST timezone
// EST is America/New_York (automatically handles EST/EDT)

/**
 * Get today's date in YYYY-MM-DD format in EST timezone
 */
export const getTodayDateEST = () => {
  const now = new Date();
  // Get date components in EST timezone
  const estDateStr = now.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  // Format: MM/DD/YYYY -> convert to YYYY-MM-DD
  const [month, day, year] = estDateStr.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date string to EST timezone
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in EST
 */
export const formatDateEST = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions = {
    timeZone: 'America/New_York',
    ...options
  };
  
  return date.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format a date string to EST timezone with time
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string in EST
 */
export const formatDateTimeEST = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions = {
    timeZone: 'America/New_York',
    ...options
  };
  
  return date.toLocaleString('en-US', defaultOptions);
};

/**
 * Normalize date string to YYYY-MM-DD format
 * Keeps the date as-is since we're storing dates without time
 */
export const normalizeDateStringEST = (dateString) => {
  if (!dateString) return getTodayDateEST();
  
  // If already in YYYY-MM-DD format, return as-is
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Parse and convert to YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return getTodayDateEST();
  
  // Get date components in EST
  const estDateStr = date.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [month, day, year] = estDateStr.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Parse date string in local timezone (not UTC)
 * When you do new Date("2025-12-01"), it treats it as UTC, which can be previous day in local time
 * This function parses YYYY-MM-DD format in local timezone
 */
export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  // Parse YYYY-MM-DD format in local timezone
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateString);
};

