const solarlunar = require("./solarlunar.js");
const DAY_MS = 24 * 60 * 60 * 1000;
const MILESTONE_CONFIG = [
  { day: 30, label: "满月纪念" },
  { day: 50, label: "50 天纪念" },
  { day: 77, label: "77 天纪念" },
  { day: 100, label: "100 天纪念" },
  { day: 131, label: "131 天纪念" },
  { day: 200, label: "200 天纪念" },
  { day: 365, label: "一周年" },
  { day: 520, label: "520 天纪念" },
  { day: 666, label: "666 天纪念" },
  { day: 777, label: "777 天纪念" },
  { day: 999, label: "999 天纪念" },
  { day: 1111, label: "1111 天纪念" },
  { day: 1314, label: "1314 天纪念" },
  { day: 1500, label: "1500 天纪念" },
  { day: 1666, label: "1666 天纪念" },
  { day: 2000, label: "2000 天纪念" },
  { day: 2222, label: "2222 天纪念" },
  { day: 2333, label: "2333 天纪念" },
  { day: 2520, label: "2520 天纪念" },
  { day: 2666, label: "2666 天纪念" },
  { day: 2999, label: "2999 天纪念" },
  { day: 3141, label: "3141 天纪念" },
  { day: 3333, label: "3333 天纪念" },
  { day: 3650, label: "十周年" },
  { day: 4000, label: "4000 天纪念" },
  { day: 4444, label: "4444 天纪念" },
  { day: 5200, label: "5200 天纪念" }
];
const MILESTONE_DAYS = MILESTONE_CONFIG.map((item) => item.day);

const SCENE_PRESETS = {
  default: {
    key: "default",
    sceneClass: "scene-default",
    badge: "日常",
    title: "今天也适合相爱",
    tag: "今天也想和你一起好好过。",
    description: "保留温柔的基础氛围，等待下一个值得庆祝的时刻。",
    chips: ["常驻柔光", "轻微漂浮", "留言陪伴"],
    metricValue: "日常",
    metricDesc: "适合安静记录"
  },
  anniversary: {
    key: "anniversary",
    sceneClass: "scene-anniversary",
    badge: "周年篇",
    title: "恋爱纪念日",
    tag: "把今天过得更有仪式感。",
    description: "首页切换为周年主题，叠加金色流光和漂浮爱心元素。",
    chips: ["周年换肤", "金色流光", "爱心漂浮"],
    metricValue: "周年篇",
    metricDesc: "适合认真纪念"
  },
  birthday: {
    key: "birthday",
    sceneClass: "scene-birthday",
    badge: "生日篇",
    title: "今天是生日",
    tag: "把蛋糕、愿望和偏爱都留给今天。",
    description: "切换为生日主题，让今天多一点庆祝感和偏爱感。",
    chips: ["生日高光", "偏爱加倍", "认真庆祝"],
    metricValue: "生日篇",
    metricDesc: "适合庆祝与许愿"
  },
  valentine: {
    key: "valentine",
    sceneClass: "scene-valentine",
    badge: "情人节",
    title: "今天是情人节",
    tag: "把爱意说得更明显一点。",
    description: "增加玫瑰色高光和花瓣粒子，让当天更有节日感。",
    chips: ["玫瑰高光", "花瓣粒子", "告白文案"],
    metricValue: "情人节",
    metricDesc: "适合说爱与偏爱"
  },
  "520": {
    key: "520",
    sceneClass: "scene-520",
    badge: "520",
    title: "今天是 520",
    tag: "甜度拉满，适合大声告白。",
    description: "切换粉橘渐变背景，并增加心动粒子和高亮徽章。",
    chips: ["520 换肤", "心动粒子", "甜度高亮"],
    metricValue: "520",
    metricDesc: "适合把喜欢说出口"
  },
  "521": {
    key: "521",
    sceneClass: "scene-521",
    badge: "521",
    title: "今天是 521",
    tag: "继续偏爱，也继续热恋。",
    description: "延续告白主题，叠加柔和光晕和闪烁气泡元素。",
    chips: ["521 光晕", "告白延续", "柔和闪烁"],
    metricValue: "521",
    metricDesc: "适合继续表态"
  },
  christmas: {
    key: "christmas",
    sceneClass: "scene-christmas",
    badge: "冬日篇",
    title: "冬日纪念时刻",
    tag: "灯光、礼物和拥抱都更适合今天。",
    description: "切换冷调冬夜主题，并增加雪点与暖光装饰。",
    chips: ["冬夜换肤", "雪点漂浮", "暖灯氛围"],
    metricValue: "冬日篇",
    metricDesc: "适合拍照与拥抱"
  },
  newyear: {
    key: "newyear",
    sceneClass: "scene-newyear",
    badge: "新年篇",
    title: "新年特别场景",
    tag: "把这一年的喜欢继续带到下一年。",
    description: "切换深色节庆氛围，强调倒数感与烟火色彩。",
    chips: ["烟火高光", "节庆粒子", "跨年氛围"],
    metricValue: "新年篇",
    metricDesc: "适合倒数与留念"
  },
  milestone: {
    key: "milestone",
    sceneClass: "scene-milestone",
    badge: "纪念日",
    title: "今天值得庆祝",
    tag: "重要天数会自动触发纪念特效。",
    description: "在关键天数自动切换高亮主题，让数字本身变成纪念感。",
    chips: ["关键天数", "数字高亮", "限定氛围"],
    metricValue: "纪念日",
    metricDesc: "重要数字已抵达"
  }
};

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

function getSceneDecorations(sceneClass) {
  const defaults = [
    { id: "spark-1", className: "scene-spark spark-one" },
    { id: "spark-2", className: "scene-spark spark-two" },
    { id: "spark-3", className: "scene-spark spark-three" },
    { id: "spark-4", className: "scene-spark spark-four" }
  ];

  const enhanced = {
    "scene-anniversary": [
      ...defaults,
      { id: "spark-5", className: "scene-spark spark-five spark-heart" },
      { id: "spark-6", className: "scene-spark spark-six spark-heart" }
    ],
    "scene-birthday": [
      ...defaults,
      { id: "bubble-1", className: "scene-spark spark-five spark-bubble" },
      { id: "bubble-2", className: "scene-spark spark-six spark-heart" }
    ],
    "scene-valentine": [
      ...defaults,
      { id: "petal-1", className: "scene-spark spark-five spark-petal" },
      { id: "petal-2", className: "scene-spark spark-six spark-petal" }
    ],
    "scene-520": [
      ...defaults,
      { id: "heart-1", className: "scene-spark spark-five spark-heart" },
      { id: "heart-2", className: "scene-spark spark-six spark-heart" }
    ],
    "scene-521": [
      ...defaults,
      { id: "glow-1", className: "scene-spark spark-five spark-bubble" },
      { id: "glow-2", className: "scene-spark spark-six spark-bubble" }
    ],
    "scene-christmas": [
      ...defaults,
      { id: "snow-1", className: "scene-spark spark-five spark-snow" },
      { id: "snow-2", className: "scene-spark spark-six spark-snow" }
    ],
    "scene-newyear": [
      ...defaults,
      { id: "fire-1", className: "scene-spark spark-five spark-firework" },
      { id: "fire-2", className: "scene-spark spark-six spark-firework" }
    ],
    "scene-milestone": [
      ...defaults,
      { id: "badge-1", className: "scene-spark spark-five spark-gold" },
      { id: "badge-2", className: "scene-spark spark-six spark-gold" }
    ]
  };

  return enhanced[sceneClass] || defaults;
}

function normalizeSpecialDate(item) {
  return {
    ...item,
    calendar: item.calendar || "solar",
    recurrence: item.recurrence || "yearly"
  };
}

function getSolarDateParts(now) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  };
}

function getLunarDateParts(now) {
  return solarlunar.solar2lunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function matchesSolarDate(item, solarDate) {
  if (Number(item.month) !== solarDate.month || Number(item.day) !== solarDate.day) {
    return false;
  }

  if (item.recurrence === "once") {
    return Number(item.year) === solarDate.year;
  }

  return true;
}

function matchesLunarDate(item, lunarDate) {
  if (item.recurrence === "once") {
    return false;
  }

  const monthMatches = Number(item.month) === Number(lunarDate.lMonth);
  const dayMatches = Number(item.day) === Number(lunarDate.lDay);
  const leapMatches = item.isLeapMonth == null ? true : Boolean(item.isLeapMonth) === Boolean(lunarDate.isLeap);

  return monthMatches && dayMatches && leapMatches;
}

function matchConfiguredScene(profile, now = new Date()) {
  const dateItems = Array.isArray(profile.specialDates) ? profile.specialDates.map(normalizeSpecialDate) : [];
  const solarDate = getSolarDateParts(now);

  const exactSolarOnce = dateItems.find(
    (item) => item.calendar === "solar" && item.recurrence === "once" && matchesSolarDate(item, solarDate)
  );

  if (exactSolarOnce) {
    return exactSolarOnce;
  }

  let lunarDate = null;

  return (
    dateItems.find((item) => {
      if (item.calendar === "lunar") {
        lunarDate = lunarDate || getLunarDateParts(now);
        return matchesLunarDate(item, lunarDate);
      }

      return matchesSolarDate(item, solarDate);
    }) || null
  );
}

function buildSceneFromPreset(presetKey, overrides = {}) {
  const preset = SCENE_PRESETS[presetKey] || SCENE_PRESETS.default;
  const scene = {
    ...preset,
    ...overrides
  };

  return {
    ...scene,
    decorations: getSceneDecorations(scene.sceneClass)
  };
}

function getSpecialScene(profile, now = new Date()) {
  const togetherDays = getTogetherDays(profile.startTime, now);
  const loveYears = getLoveYears(profile.startTime, now);

  const configuredScene = matchConfiguredScene(profile, now);
  if (configuredScene) {
    const presetKey = configuredScene.key || "default";
    const sceneOverrides = {
      ...configuredScene
    };

    if (presetKey === "anniversary" && !sceneOverrides.tag && loveYears > 0) {
      sceneOverrides.tag = `这是我们的第 ${loveYears} 个恋爱周年。`;
    }

    return buildSceneFromPreset(presetKey, sceneOverrides);
  }

  if (isMilestoneDay(togetherDays)) {
    return buildSceneFromPreset("milestone", {
      title: `今天是第 ${togetherDays} 天`,
      tag: `${getMilestoneLabel(togetherDays)} 已解锁。`,
      badge: `${togetherDays} DAY`
    });
  }

  return buildSceneFromPreset("default", {
    title: profile.title || SCENE_PRESETS.default.title,
    tag: profile.promise || SCENE_PRESETS.default.tag
  });
}

module.exports = {
  formatDate,
  formatDateTime,
  getDuration,
  getTogetherDays,
  getLoveYears,
  getMilestoneBadgeData,
  getSpecialScene
};