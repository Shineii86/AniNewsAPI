/**
 * Advanced Date Parser for Anime News Sources
 * Handles various date formats and relative time strings
 */

const MONTHS = {
  'january': 0, 'jan': 0,
  'february': 1, 'feb': 1,
  'march': 2, 'mar': 2,
  'april': 3, 'apr': 3,
  'may': 4,
  'june': 5, 'jun': 5,
  'july': 6, 'jul': 6,
  'august': 7, 'aug': 7,
  'september': 8, 'sep': 8, 'sept': 8,
  'october': 9, 'oct': 9,
  'november': 10, 'nov': 10,
  'december': 11, 'dec': 11
};

const RELATIVE_TIME = {
  'just now': 0,
  'a minute ago': 1,
  'an hour ago': 60,
  'a day ago': 1440,
  'a week ago': 10080,
  'a month ago': 43200,
  'a year ago': 525600
};

/**
 * Parse relative time strings like "2 hours ago", "3 days ago"
 */
function parseRelativeTime(text) {
  const lower = text.toLowerCase().trim();
  
  // Check exact matches
  if (RELATIVE_TIME[lower] !== undefined) {
    return new Date(Date.now() - RELATIVE_TIME[lower] * 60 * 1000);
  }
  
  // Parse patterns like "X minutes/hours/days/weeks/months/years ago"
  const patterns = [
    { regex: /(\d+)\s*minute?s?\s*ago/i, multiplier: 60 * 1000 },
    { regex: /(\d+)\s*hour?s?\s*ago/i, multiplier: 60 * 60 * 1000 },
    { regex: /(\d+)\s*day?s?\s*ago/i, multiplier: 24 * 60 * 60 * 1000 },
    { regex: /(\d+)\s*week?s?\s*ago/i, multiplier: 7 * 24 * 60 * 60 * 1000 },
    { regex: /(\d+)\s*month?s?\s*ago/i, multiplier: 30 * 24 * 60 * 60 * 1000 },
    { regex: /(\d+)\s*year?s?\s*ago/i, multiplier: 365 * 24 * 60 * 60 * 1000 }
  ];
  
  for (const pattern of patterns) {
    const match = lower.match(pattern.regex);
    if (match) {
      const value = parseInt(match[1]);
      return new Date(Date.now() - value * pattern.multiplier);
    }
  }
  
  return null;
}

/**
 * Parse various date formats
 */
function parseDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  dateStr = dateStr.trim();
  
  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Parse relative time
  date = parseRelativeTime(dateStr);
  if (date) return date;
  
  // Parse formats like "July 17, 2025" or "Jul 17, 2025"
  const monthDayYear = dateStr.match(/([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (monthDayYear) {
    const month = MONTHS[monthDayYear[1].toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(monthDayYear[2]);
      const year = parseInt(monthDayYear[3]);
      return new Date(year, month, day);
    }
  }
  
  // Parse formats like "17 July 2025" or "17 Jul 2025"
  const dayMonthYear = dateStr.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
  if (dayMonthYear) {
    const month = MONTHS[dayMonthYear[2].toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(dayMonthYear[1]);
      const year = parseInt(dayMonthYear[3]);
      return new Date(year, month, day);
    }
  }
  
  // Parse formats like "2025-07-17" or "2025/07/17"
  const isoLike = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoLike) {
    return new Date(parseInt(isoLike[1]), parseInt(isoLike[2]) - 1, parseInt(isoLike[3]));
  }
  
  // Parse formats like "17-07-2025" or "17/07/2025"
  const euroDate = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (euroDate) {
    return new Date(parseInt(euroDate[3]), parseInt(euroDate[2]) - 1, parseInt(euroDate[1]));
  }
  
  // Parse time-only formats (assume today)
  const timeOnly = dateStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeOnly) {
    const now = new Date();
    let hours = parseInt(timeOnly[1]);
    const minutes = parseInt(timeOnly[2]);
    const ampm = timeOnly[4]?.toLowerCase();
    
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    now.setHours(hours, minutes, 0, 0);
    return now;
  }
  
  return null;
}

/**
 * Main parse function with fallback
 */
function parse(dateInput, fallback = new Date()) {
  if (!dateInput) return fallback;
  
  // If already a Date object
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? fallback : dateInput;
  }
  
  const parsed = parseDateString(dateInput);
  return parsed || fallback;
}

/**
 * Parse MyAnimeList date format
 */
function parseMALDate(infoText) {
  if (!infoText) return new Date();
  
  // MAL format: "12:34 AM, Yesterday" or "Jul 17, 12:34 AM"
  const info = infoText.toLowerCase();
  
  if (info.includes('just now') || info.includes('seconds ago')) {
    return new Date();
  }
  
  if (info.includes('minutes ago')) {
    const mins = parseInt(info.match(/(\d+)\s*minutes?\s*ago/)?.[1] || 0);
    return new Date(Date.now() - mins * 60 * 1000);
  }
  
  if (info.includes('hour') && info.includes('ago')) {
    const hours = parseInt(info.match(/(\d+)\s*hours?\s*ago/)?.[1] || 1);
    return new Date(Date.now() - hours * 60 * 60 * 1000);
  }
  
  if (info.includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  
  if (info.includes('days ago')) {
    const days = parseInt(info.match(/(\d+)\s*days?\s*ago/)?.[1] || 1);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
  
  // Try to parse date like "Jul 17, 12:34 AM"
  const dateMatch = info.match(/([a-z]{3,})\s+(\d{1,2}),?\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (dateMatch) {
    const month = MONTHS[dateMatch[1].toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(dateMatch[2]);
      let hours = parseInt(dateMatch[3]);
      const minutes = parseInt(dateMatch[4]);
      const ampm = dateMatch[5]?.toLowerCase();
      
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      const year = new Date().getFullYear();
      return new Date(year, month, day, hours, minutes);
    }
  }
  
  return new Date();
}

module.exports = {
  parse,
  parseMALDate,
  parseRelativeTime,
  parseDateString
};
