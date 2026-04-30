const DAY_MS = 24 * 60 * 60 * 1000;

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

module.exports = {
  formatDate,
  formatDateTime,
  getDuration,
  getTogetherDays,
  getLoveYears
};
