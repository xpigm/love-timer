const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function pad(value) {
  return value < 10 ? `0${value}` : `${value}`;
}

function parseDateTime(dateTimeString) {
  const normalized = String(dateTimeString).trim().replace(/-/g, "/");
  const value = normalized.includes(":") ? normalized : `${normalized} 00:00:00`;
  return new Date(value);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDuration(startTime, now = new Date()) {
  const start = parseDateTime(startTime);
  const diff = Math.max(0, now.getTime() - start.getTime());
  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  return {
    days: `${days}`,
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds)
  };
}

function getTogetherDays(startTime, now = new Date()) {
  const start = parseDateTime(startTime);
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / DAY_MS));
}

function getLoveYears(startTime, now = new Date()) {
  const start = parseDateTime(startTime);
  let years = now.getFullYear() - start.getFullYear();
  const anniversary = new Date(start);
  anniversary.setFullYear(now.getFullYear());

  if (now.getTime() < anniversary.getTime()) {
    years -= 1;
  }

  return Math.max(0, years);
}

function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatShortDateTime(date) {
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${formatTime(date)}`;
}

function isYesterday(date, now) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return date.getFullYear() === yesterday.getFullYear()
    && date.getMonth() === yesterday.getMonth()
    && date.getDate() === yesterday.getDate();
}

function formatRelativeTime(timestamp, now = new Date()) {
  const value = Number(timestamp || 0);
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const diff = Math.max(0, now.getTime() - value);

  if (diff < MINUTE_MS) {
    return "刚刚";
  }

  if (diff < HOUR_MS) {
    return `${Math.floor(diff / MINUTE_MS)}分钟前`;
  }

  if (diff < DAY_MS) {
    return `${Math.floor(diff / HOUR_MS)}小时前`;
  }

  if (isYesterday(date, now)) {
    return `昨天 ${formatTime(date)}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return formatShortDateTime(date);
  }

  return formatDateTime(date);
}

module.exports = {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getDuration,
  getTogetherDays,
  getLoveYears
};
