import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

// Enable plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);

/**
 * Format a date string to a relative time string (e.g., "2 hours ago")
 * @param {string|number|Date} dateString - The date to format
 * @returns {string} - Formatted relative time or fallback
 */
export const getTimeAgo = (dateString) => {
  if (!dateString) return "Unknown";

  try {
    let date;

    // Handle different date formats
    if (typeof dateString === 'string') {
      // Try ISO string first
      date = dayjs(dateString);
      if (!date.isValid()) {
        // Try parsing as timestamp
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          // Check if it's seconds (10 digits) or milliseconds (13 digits)
          if (dateString.length === 10) {
            date = dayjs.unix(timestamp);
          } else if (dateString.length === 13) {
            date = dayjs(timestamp);
          } else {
            date = dayjs(dateString);
          }
        }
      }
    } else if (typeof dateString === 'number') {
      // Assume milliseconds timestamp
      date = dayjs(dateString);
    } else if (dateString instanceof Date) {
      date = dayjs(dateString);
    }

    // Check if date is valid
    if (!date || !date.isValid()) {
      return "Unknown";
    }

    const now = dayjs();
    const diffInMinutes = now.diff(date, 'minute');
    const diffInHours = now.diff(date, 'hour');
    const diffInDays = now.diff(date, 'day');

    // For very recent events
    if (diffInMinutes < 1) {
      if (date.isBefore(now.subtract(2, 'minute'))) return "Moments ago";
      return "Just now";
    }
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    // For recent events
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    // For older events
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    // For very old events, show the actual date
    return date.format('MMM D, YYYY');
  } catch (error) {
    console.warn('Error parsing date:', dateString, error);
    return "Unknown";
  }
};

/**
 * Format a date to a readable string
 * @param {string|number|Date} dateString - The date to format
 * @param {string} format - The format pattern (default: 'MMM D, YYYY HH:mm')
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, format = 'MMM D, YYYY HH:mm') => {
  if (!dateString) return "Unknown";

  try {
    let date;

    if (typeof dateString === 'string') {
      date = dayjs(dateString);
      if (!date.isValid()) {
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          if (dateString.length === 10) {
            date = dayjs.unix(timestamp);
          } else {
            date = dayjs(timestamp);
          }
        }
      }
    } else if (typeof dateString === 'number') {
      date = dayjs(dateString);
    } else if (dateString instanceof Date) {
      date = dayjs(dateString);
    }

    if (!date || !date.isValid()) {
      return "Unknown";
    }

    return date.format(format);
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return "Unknown";
  }
};

/**
 * Check if a date is within a certain time range
 * @param {string|number|Date} dateString - The date to check
 * @param {number} hours - Hours to check against
 * @returns {boolean} - Whether the date is within the range
 */
export const isWithinHours = (dateString, hours = 24) => {
  if (!dateString) return false;

  try {
    let date;

    if (typeof dateString === 'string') {
      date = dayjs(dateString);
      if (!date.isValid()) {
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          if (dateString.length === 10) {
            date = dayjs.unix(timestamp);
          } else {
            date = dayjs(timestamp);
          }
        }
      }
    } else if (typeof dateString === 'number') {
      date = dayjs(dateString);
    } else if (dateString instanceof Date) {
      date = dayjs(dateString);
    }

    if (!date || !date.isValid()) {
      return false;
    }

    const now = dayjs();
    return now.diff(date, 'hour') <= hours;
  } catch (error) {
    return false;
  }
};