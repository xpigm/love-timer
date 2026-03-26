const DAY_MS = 24 * 60 * 60 * 1000;
const MILESTONES = [30, 50, 100, 131, 200, 365, 520, 666, 999, 1000, 1314, 2000, 3650];

function pad(value) {
  return value < 10 ? `0${value}` : `${value}`;
}

function parseDate(dateString) {
  return new Date(`${dateString.replace(/-/g, "/")} 00:00:00`);
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

function getDuration(startDate, now = new Date()) {
  const start = parseDate(startDate);
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

function getTogetherDays(startDate, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today.getTime() - parseDate(startDate).getTime()) / DAY_MS));
}

function getMilestoneLabel(day) {
  if (day === 30) {
    return "满月纪念";
  }
  if (day === 365) {
    return "一周年";
  }
  if (day === 1000) {
    return "千日纪念";
  }
  if (day === 3650) {
    return "十周年";
  }
  return `${day} 天纪念`;
}

function getUpcomingMilestones(startDate, now = new Date()) {
  const togetherDays = getTogetherDays(startDate, now);
  return MILESTONES
    .filter((day) => day > togetherDays)
    .slice(0, 3)
    .map((day) => ({
      day,
      label: getMilestoneLabel(day),
      leftText: `还有 ${day - togetherDays} 天`
    }));
}

function getSpecialMoment(profile, now = new Date()) {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const togetherDays = getTogetherDays(profile.startDate, now);
  const start = parseDate(profile.startDate);

  if (month === 5 && day === 20) {
    return {
      title: "今天是 520",
      tag: "甜度拉满"
    };
  }

  if (month === 5 && day === 21) {
    return {
      title: "今天是 521",
      tag: "继续偏爱"
    };
  }

  if (month === 2 && day === 14) {
    return {
      title: "今天是情人节",
      tag: "记得表达爱意"
    };
  }

  if (month === start.getMonth() + 1 && day === start.getDate() && togetherDays > 0) {
    return {
      title: "今天是恋爱纪念日",
      tag: `${Math.max(1, Math.floor(togetherDays / 365))} 周年`
    };
  }

  if ([100, 365, 520, 999, 1314, 2000].includes(togetherDays)) {
    return {
      title: "今天值得庆祝",
      tag: `第 ${togetherDays} 天`
    };
  }

  return {
    title: profile.title || "我们已经相恋",
    tag: profile.promise || "把普通日子过成纪念日。"
  };
}

module.exports = {
  formatDate,
  formatDateTime,
  getDuration,
  getTogetherDays,
  getUpcomingMilestones,
  getSpecialMoment
};
