const { getTogetherDays } = require("./time");

const MILESTONE_CONFIG = [
  { day: 30, label: "30 天纪念" },
  { day: 50, label: "50 天纪念" },
  { day: 77, label: "77 天纪念" },
  { day: 88, label: "88 天纪念" },
  { day: 99, label: "99 天纪念" },
  { day: 100, label: "100 天纪念" },
  { day: 131, label: "131 天纪念" },
  { day: 188, label: "188 天纪念" },
  { day: 200, label: "200 天纪念" },
  { day: 300, label: "300 天纪念" },
  { day: 365, label: "365 天纪念" },
  { day: 520, label: "520 天纪念" },
  { day: 521, label: "521 天纪念" },
  { day: 666, label: "666 天纪念" },
  { day: 777, label: "777 天纪念" },
  { day: 888, label: "888 天纪念" },
  { day: 999, label: "999 天纪念" },
  { day: 1000, label: "1000 天纪念" },
  { day: 1111, label: "1111 天纪念" },
  { day: 1212, label: "1212 天纪念" },
  { day: 1314, label: "1314 天纪念" },
  { day: 1500, label: "1500 天纪念" },
  { day: 1666, label: "1666 天纪念" },
  { day: 2000, label: "2000 天纪念" },
  { day: 2024, label: "2024 天纪念" },
  { day: 2222, label: "2222 天纪念" },
  { day: 2333, label: "2333 天纪念" },
  { day: 2500, label: "2500 天纪念" },
  { day: 2520, label: "2520 天纪念" },
  { day: 2666, label: "2666 天纪念" },
  { day: 2999, label: "2999 天纪念" },
  { day: 3000, label: "3000 天纪念" },
  { day: 3141, label: "3141 天纪念" },
  { day: 3333, label: "3333 天纪念" },
  { day: 3650, label: "3650 天纪念" },
  { day: 4000, label: "4000 天纪念" },
  { day: 4444, label: "4444 天纪念" },
  { day: 5000, label: "5000 天纪念" },
  { day: 5200, label: "5200 天纪念" }
];

function getMilestoneMeta(day) {
  return MILESTONE_CONFIG.find((item) => item.day === day) || null;
}

function getMilestoneLabel(day) {
  const milestone = getMilestoneMeta(day);
  return milestone ? milestone.label : `${day} 天纪念`;
}

function isMilestoneDay(day) {
  return Boolean(getMilestoneMeta(day));
}

function getNextMilestone(day) {
  return MILESTONE_CONFIG.find((item) => item.day > day) || null;
}

function getLatestMilestone(day) {
  for (let index = MILESTONE_CONFIG.length - 1; index >= 0; index -= 1) {
    if (day >= MILESTONE_CONFIG[index].day) {
      return MILESTONE_CONFIG[index];
    }
  }

  return null;
}

function getMilestoneBadgeData(startTime, now = new Date()) {
  const currentDays = getTogetherDays(startTime, now);
  const exactMilestone = getMilestoneMeta(currentDays);
  const nextMilestone = getNextMilestone(currentDays);
  const latestMilestone = getLatestMilestone(currentDays);

  if (exactMilestone) {
    return {
      visible: true,
      isExactMilestone: true,
      badgeText: "MILESTONE UNLOCKED",
      label: exactMilestone.label,
      description: `今天正好是第 ${currentDays} 天`,
      accentText: nextMilestone ? `下一站：${nextMilestone.label}` : "把以后也继续过成值得庆祝的日子。",
      currentDays,
      next: nextMilestone
        ? {
            day: nextMilestone.day,
            label: nextMilestone.label,
            remainingDays: nextMilestone.day - currentDays
          }
        : null
    };
  }

  if (currentDays >= 2000) {
    return {
      visible: true,
      isExactMilestone: false,
      badgeText: "2000+ DAYS",
      label: `已经一起走过 ${currentDays} 天`,
      description: nextMilestone
        ? `距离${nextMilestone.label}还有 ${nextMilestone.day - currentDays} 天`
        : `最近抵达的是${latestMilestone ? latestMilestone.label : "重要纪念日"}`,
      accentText: "两千天以后，也想继续把平常日子过成纪念日。",
      currentDays,
      next: nextMilestone
        ? {
            day: nextMilestone.day,
            label: nextMilestone.label,
            remainingDays: nextMilestone.day - currentDays
          }
        : null
    };
  }

  if (nextMilestone) {
    return {
      visible: true,
      isExactMilestone: false,
      badgeText: "NEXT MILESTONE",
      label: `奔向第 ${nextMilestone.day} 天`,
      description: `距离${nextMilestone.label}还有 ${nextMilestone.day - currentDays} 天`,
      accentText: `今天是第 ${currentDays} 天`,
      currentDays,
      next: {
        day: nextMilestone.day,
        label: nextMilestone.label,
        remainingDays: nextMilestone.day - currentDays
      }
    };
  }

  return {
    visible: true,
    isExactMilestone: false,
    badgeText: "LOVE ARCHIVE",
    label: `已经一起走过 ${currentDays} 天`,
    description: latestMilestone ? `最近抵达的是${latestMilestone.label}` : "每一天都在继续累计。",
    accentText: "数字会继续增加，喜欢也会继续按天累计。",
    currentDays,
    next: null
  };
}

module.exports = {
  getMilestoneLabel,
  isMilestoneDay,
  getMilestoneBadgeData
};
