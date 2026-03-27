const DAY_MS = 24 * 60 * 60 * 1000;
const MILESTONE_DAYS = [100, 365, 520, 999, 1314, 2000];

const SCENE_PRESETS = {
  default: {
    key: "default",
    sceneClass: "scene-default",
    badge: "温柔日常",
    title: "今天也适合相爱",
    tag: "把普通日子过成纪念日。",
    description: "保留温柔的基础氛围，等待下一个值得庆祝的时刻。",
    chips: ["常驻柔光", "轻微漂浮", "留言陪伴"],
    metricValue: "柔光日常",
    metricDesc: "温柔氛围陪伴"
  },
  anniversary: {
    key: "anniversary",
    sceneClass: "scene-anniversary",
    badge: "周年流光",
    title: "恋爱纪念日",
    tag: "把今天过得更有仪式感。",
    description: "首页切换为周年主题，叠加金色流光和漂浮爱心元素。",
    chips: ["周年换肤", "金色流光", "爱心漂浮"],
    metricValue: "周年庆祝",
    metricDesc: "适合截图留念"
  },
  valentine: {
    key: "valentine",
    sceneClass: "scene-valentine",
    badge: "玫瑰特效",
    title: "今天是情人节",
    tag: "把爱意说得更明显一点。",
    description: "增加玫瑰色高光和花瓣粒子，让当天更有节日感。",
    chips: ["玫瑰高光", "花瓣粒子", "告白文案"],
    metricValue: "玫瑰流光",
    metricDesc: "节日氛围增强"
  },
  "520": {
    key: "520",
    sceneClass: "scene-520",
    badge: "心动粒子",
    title: "今天是 520",
    tag: "甜度拉满，适合大声告白。",
    description: "切换粉橘渐变背景，并增加心动粒子和高亮徽章。",
    chips: ["520 换肤", "心动粒子", "甜度高亮"],
    metricValue: "甜度拉满",
    metricDesc: "告白氛围已开启"
  },
  "521": {
    key: "521",
    sceneClass: "scene-521",
    badge: "告白光晕",
    title: "今天是 521",
    tag: "继续偏爱，也继续热恋。",
    description: "延续告白主题，叠加柔和光晕和闪烁气泡元素。",
    chips: ["521 光晕", "告白延续", "柔和闪烁"],
    metricValue: "偏爱继续",
    metricDesc: "氛围持续在线"
  },
  christmas: {
    key: "christmas",
    sceneClass: "scene-christmas",
    badge: "圣诞飘雪",
    title: "冬日纪念时刻",
    tag: "灯光、礼物和拥抱都更适合今天。",
    description: "切换冷调冬夜主题，并增加雪点与暖光装饰。",
    chips: ["冬夜换肤", "雪点漂浮", "暖灯氛围"],
    metricValue: "冬日浪漫",
    metricDesc: "节日氛围增强"
  },
  newyear: {
    key: "newyear",
    sceneClass: "scene-newyear",
    badge: "新年烟火",
    title: "新年特别场景",
    tag: "把这一年的喜欢继续带到下一年。",
    description: "切换深色节庆氛围，强调倒数感与烟火色彩。",
    chips: ["烟火高光", "节庆粒子", "跨年氛围"],
    metricValue: "节庆高亮",
    metricDesc: "适合倒数和截图"
  },
  milestone: {
    key: "milestone",
    sceneClass: "scene-milestone",
    badge: "特别计数",
    title: "今天值得庆祝",
    tag: "重要天数会自动触发纪念特效。",
    description: "在关键天数自动切换高亮主题，让数字本身变成纪念感。",
    chips: ["关键天数", "数字高亮", "限定氛围"],
    metricValue: "数字纪念",
    metricDesc: "里程碑特效触发"
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

function getMilestoneLabel(day) {
  if (day === 100) {
    return "100 天纪念";
  }
  if (day === 365) {
    return "一周年";
  }
  if (day === 520) {
    return "520 天纪念";
  }
  if (day === 1314) {
    return "1314 天纪念";
  }
  return `${day} 天纪念`;
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

function matchConfiguredScene(profile, month, day) {
  const dateItems = Array.isArray(profile.specialDates) ? profile.specialDates : [];
  return dateItems.find((item) => Number(item.month) === month && Number(item.day) === day) || null;
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
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const togetherDays = getTogetherDays(profile.startTime, now);
  const loveYears = getLoveYears(profile.startTime, now);

  const configuredScene = matchConfiguredScene(profile, month, day);
  if (configuredScene) {
    const presetKey = configuredScene.key || "default";
    const sceneOverrides = {
      ...configuredScene
    };

    if (presetKey === "anniversary" && loveYears > 0) {
      sceneOverrides.tag = `这是我们的第 ${loveYears} 个恋爱周年。`;
    }

    return buildSceneFromPreset(presetKey, sceneOverrides);
  }

  if (MILESTONE_DAYS.includes(togetherDays)) {
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
  getSpecialScene
};
