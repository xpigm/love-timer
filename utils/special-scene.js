const solarlunar = require("./solarlunar.js");
const { getTogetherDays, getLoveYears } = require("./time");
const { getMilestoneLabel, isMilestoneDay } = require("./milestone");

const SCENE_PRESETS = {
  default: {
    key: "default",
    sceneClass: "scene-default",
    badge: "日常",
    title: "今天也适合相爱",
    tag: "",
    description: "保留温柔的基础氛围，等待下一个值得庆祝的时刻。",
    metricValue: "日常",
    metricDesc: "适合安静记录",
    heroEyebrow: "LOVE POSTER",
    heroSubline: "把普通的一天也过成会想回看的纪念。",
    momentKicker: "今日此刻",
    wallKicker: "MEMORY WALL",
    wallTitle: "把想说的话慢慢留下来",
    wallBody: "不着急热闹，把平常的一句喜欢也写下来。",
    composerTitle: "写下第一条",
    composerBody: "先记一句，留言墙就会从这里开始。",
    sceneMood: "soft",
    sceneIntensity: "default",
    orbMode: "soft",
    particleMode: "light",
    chipStyle: "glass",
    badgeStyle: "glass"
  },
  anniversary: {
    key: "anniversary",
    sceneClass: "scene-anniversary",
    badge: "周年篇",
    title: "恋爱纪念日",
    tag: "把今天过得更有仪式感。",
    description: "首页切换为周年主题，叠加金色流光和漂浮爱心元素。",
    metricValue: "周年篇",
    metricDesc: "适合认真纪念",
    heroEyebrow: "ANNIVERSARY EDITION",
    heroSubline: "让今天像一张正式保存的纪念海报。",
    momentKicker: "周年此刻",
    wallKicker: "ANNIVERSARY WALL",
    wallTitle: "把今天的纪念写下来",
    wallBody: "今天值得认真写下一句，以后翻到会像再次回到这一天。",
    composerTitle: "给周年留一张卡片",
    composerBody: "写一句今天最想留住的话，给这张纪念海报落款。",
    sceneMood: "ceremony",
    sceneIntensity: "exact",
    orbMode: "champagne",
    particleMode: "ribbon",
    chipStyle: "medal",
    badgeStyle: "seal"
  },
  birthday: {
    key: "birthday",
    sceneClass: "scene-birthday",
    badge: "生日篇",
    title: "今天是生日",
    tag: "把蛋糕、愿望和偏爱都留给今天。",
    description: "切换为生日主题，让今天多一点庆祝感和偏爱感。",
    metricValue: "生日篇",
    metricDesc: "适合庆祝与许愿",
    heroEyebrow: "BIRTHDAY SPOTLIGHT",
    heroSubline: "今天的舞台只留给被认真偏爱的人。",
    momentKicker: "生日时刻",
    wallKicker: "BIRTHDAY NOTES",
    wallTitle: "给今天留一份生日偏爱",
    wallBody: "把祝福、愿望和小小开心都写进今天的生日卡片里。",
    composerTitle: "写一句生日偏爱",
    composerBody: "一句祝福、一点心愿，都会让今天更完整。",
    sceneMood: "celebration",
    sceneIntensity: "special",
    orbMode: "balloon",
    particleMode: "bubble",
    chipStyle: "soft",
    badgeStyle: "spotlight"
  },
  valentine: {
    key: "valentine",
    sceneClass: "scene-valentine",
    badge: "情人节",
    title: "今天是情人节",
    tag: "把爱意说得更明显一点。",
    description: "增加玫瑰色高光和花瓣粒子，让当天更有节日感。",
    metricValue: "情人节",
    metricDesc: "适合说爱与偏爱",
    heroEyebrow: "VALENTINE SPECIAL",
    heroSubline: "今天不需要含蓄，适合让喜欢更明显一点。",
    momentKicker: "告白时刻",
    wallKicker: "VALENTINE LETTER",
    wallTitle: "把今天的爱意再写清楚一点",
    wallBody: "有些喜欢适合当面说，也适合在今天认真写下来。",
    composerTitle: "写一句告白",
    composerBody: "今天适合偏爱、告白和把心动说得更完整。",
    sceneMood: "rose",
    sceneIntensity: "special",
    orbMode: "bloom",
    particleMode: "petal",
    chipStyle: "rose",
    badgeStyle: "glow"
  },
  "520": {
    key: "520",
    sceneClass: "scene-520",
    badge: "520",
    title: "今天是 520",
    tag: "甜度拉满，适合大声告白。",
    description: "切换粉橘渐变背景，并增加心动粒子和高亮徽章。",
    metricValue: "520",
    metricDesc: "适合把喜欢说出口",
    heroEyebrow: "520 CONFESSION MODE",
    heroSubline: "今天适合把喜欢说出口，也适合让整张海报都更甜。",
    momentKicker: "520 此刻",
    wallKicker: "520 LETTER",
    wallTitle: "给 520 留一封偏爱短信",
    wallBody: "今天写下来的每一句，都像比平常更大声一点的告白。",
    composerTitle: "写一句 520 告白",
    composerBody: "不用太长，今天的一句喜欢就足够闪亮。",
    sceneMood: "confession",
    sceneIntensity: "exact",
    orbMode: "heart-bloom",
    particleMode: "heart",
    chipStyle: "rose",
    badgeStyle: "seal"
  },
  "521": {
    key: "521",
    sceneClass: "scene-521",
    badge: "521",
    title: "今天是 521",
    tag: "继续偏爱，也继续热恋。",
    description: "延续告白主题，叠加柔和光晕和闪烁气泡元素。",
    metricValue: "521",
    metricDesc: "适合继续表态",
    heroEyebrow: "521 AFTERGLOW",
    heroSubline: "热烈过后，把喜欢继续留在今天的余温里。",
    momentKicker: "521 余温",
    wallKicker: "521 AFTERNOTE",
    wallTitle: "把昨天和今天的偏爱都收好",
    wallBody: "这一页更像告白之后的回音，适合写下一句继续喜欢。",
    composerTitle: "写一句继续偏爱",
    composerBody: "今天的喜欢更柔和一点，也更适合慢慢留下来。",
    sceneMood: "afterglow",
    sceneIntensity: "special",
    orbMode: "halo",
    particleMode: "glow-bubble",
    chipStyle: "soft",
    badgeStyle: "glow"
  },
  christmas: {
    key: "christmas",
    sceneClass: "scene-christmas",
    badge: "冬日篇",
    title: "冬日纪念时刻",
    tag: "灯光、礼物和拥抱都更适合今天。",
    description: "切换冷调冬夜主题，并增加雪点与暖光装饰。",
    metricValue: "冬日篇",
    metricDesc: "适合拍照与拥抱",
    heroEyebrow: "WINTER LIGHTS",
    heroSubline: "让今天像一张有灯串和雪点的冬日纪念卡。",
    momentKicker: "冬日此刻",
    wallKicker: "WINTER MEMORY",
    wallTitle: "把今天的冬日心情写下来",
    wallBody: "适合记录礼物、灯光、拥抱，和让人想靠近的冬日瞬间。",
    composerTitle: "留一句冬日偏爱",
    composerBody: "写下今天的暖意，等以后再读还是会想靠近。",
    sceneMood: "frost",
    sceneIntensity: "special",
    orbMode: "frost",
    particleMode: "snow",
    chipStyle: "frost",
    badgeStyle: "frost"
  },
  newyear: {
    key: "newyear",
    sceneClass: "scene-newyear",
    badge: "新年篇",
    title: "新年特别场景",
    tag: "把这一年的喜欢继续带到下一年。",
    description: "切换深色节庆氛围，强调倒数感与烟火色彩。",
    metricValue: "新年篇",
    metricDesc: "适合倒数与留念",
    heroEyebrow: "NEW YEAR COUNTDOWN",
    heroSubline: "让这一页像零点前后的限定夜景一样闪亮。",
    momentKicker: "跨年时刻",
    wallKicker: "NEW YEAR NOTES",
    wallTitle: "给这一年和下一年各留一句",
    wallBody: "现在写下的一句，会像从今年带到明年的小小烟火。",
    composerTitle: "写一句跨年心愿",
    composerBody: "适合写愿望、感谢，或者一句想继续带到明年的喜欢。",
    sceneMood: "night-festival",
    sceneIntensity: "exact",
    orbMode: "firework",
    particleMode: "firework",
    chipStyle: "festival",
    badgeStyle: "seal"
  },
  milestone: {
    key: "milestone",
    sceneClass: "scene-milestone",
    badge: "纪念日",
    title: "今天值得庆祝",
    tag: "重要天数会自动触发纪念特效。",
    description: "在关键天数自动切换高亮主题，让数字本身变成纪念感。",
    metricValue: "纪念日",
    metricDesc: "重要数字已抵达",
    heroEyebrow: "MILESTONE UNLOCKED",
    heroSubline: "今天不是普通的一天，是值得被单独装订的一页。",
    momentKicker: "纪念时刻",
    wallKicker: "MILESTONE NOTES",
    wallTitle: "给这个数字留一张记录卡",
    wallBody: "有些天数天生值得单独收藏，今天就是其中一页。",
    composerTitle: "给这个纪念日落款",
    composerBody: "写一句今天的感受，让这个数字真的被认真保存。",
    sceneMood: "unlock",
    sceneIntensity: "exact",
    orbMode: "trophy",
    particleMode: "gold",
    chipStyle: "medal",
    badgeStyle: "medal"
  }
};

function getSceneDecorations(sceneClass) {
  const defaults = [
    { id: "fx-a", className: "scene-fx fx-top-left fx-orbit" },
    { id: "fx-b", className: "scene-fx fx-top-right fx-orbit" },
    { id: "fx-c", className: "scene-fx fx-hero-left fx-orbit" },
    { id: "fx-d", className: "scene-fx fx-lower-right fx-orbit" }
  ];

  const enhanced = {
    "scene-anniversary": [
      { id: "ann-a", className: "scene-fx fx-top-left fx-ribbon" },
      { id: "ann-b", className: "scene-fx fx-top-right fx-gold" },
      { id: "ann-c", className: "scene-fx fx-hero-left fx-gold" },
      { id: "ann-d", className: "scene-fx fx-hero-right fx-ribbon" },
      { id: "ann-e", className: "scene-fx fx-lower-left fx-heart" },
      { id: "ann-f", className: "scene-fx fx-lower-right fx-gold" }
    ],
    "scene-birthday": [
      { id: "bir-a", className: "scene-fx fx-top-left fx-confetti" },
      { id: "bir-b", className: "scene-fx fx-top-right fx-bubble" },
      { id: "bir-c", className: "scene-fx fx-hero-left fx-bubble" },
      { id: "bir-d", className: "scene-fx fx-hero-right fx-confetti" },
      { id: "bir-e", className: "scene-fx fx-lower-left fx-bubble" },
      { id: "bir-f", className: "scene-fx fx-lower-right fx-heart" }
    ],
    "scene-valentine": [
      { id: "val-a", className: "scene-fx fx-top-left fx-petal" },
      { id: "val-b", className: "scene-fx fx-top-right fx-heart" },
      { id: "val-c", className: "scene-fx fx-hero-left fx-heart" },
      { id: "val-d", className: "scene-fx fx-hero-right fx-petal" },
      { id: "val-e", className: "scene-fx fx-lower-left fx-petal" },
      { id: "val-f", className: "scene-fx fx-lower-right fx-heart" }
    ],
    "scene-520": [
      { id: "520-a", className: "scene-fx fx-top-left fx-heart" },
      { id: "520-b", className: "scene-fx fx-top-right fx-heart" },
      { id: "520-c", className: "scene-fx fx-hero-left fx-ribbon" },
      { id: "520-d", className: "scene-fx fx-hero-right fx-heart" },
      { id: "520-e", className: "scene-fx fx-lower-left fx-heart" },
      { id: "520-f", className: "scene-fx fx-lower-right fx-gold" }
    ],
    "scene-521": [
      { id: "521-a", className: "scene-fx fx-top-left fx-glow-bubble" },
      { id: "521-b", className: "scene-fx fx-top-right fx-glow-bubble" },
      { id: "521-c", className: "scene-fx fx-hero-left fx-bubble" },
      { id: "521-d", className: "scene-fx fx-hero-right fx-heart" },
      { id: "521-e", className: "scene-fx fx-lower-left fx-glow-bubble" },
      { id: "521-f", className: "scene-fx fx-lower-right fx-bubble" }
    ],
    "scene-christmas": [
      { id: "chr-a", className: "scene-fx fx-top-left fx-snow" },
      { id: "chr-b", className: "scene-fx fx-top-right fx-snow" },
      { id: "chr-c", className: "scene-fx fx-hero-left fx-snow" },
      { id: "chr-d", className: "scene-fx fx-hero-right fx-frost" },
      { id: "chr-e", className: "scene-fx fx-lower-left fx-snow" },
      { id: "chr-f", className: "scene-fx fx-lower-right fx-gold" }
    ],
    "scene-newyear": [
      { id: "new-a", className: "scene-fx fx-top-left fx-firework" },
      { id: "new-b", className: "scene-fx fx-top-right fx-firework" },
      { id: "new-c", className: "scene-fx fx-hero-left fx-gold" },
      { id: "new-d", className: "scene-fx fx-hero-right fx-firework" },
      { id: "new-e", className: "scene-fx fx-lower-left fx-ribbon" },
      { id: "new-f", className: "scene-fx fx-lower-right fx-gold" }
    ],
    "scene-milestone": [
      { id: "mil-a", className: "scene-fx fx-top-left fx-gold" },
      { id: "mil-b", className: "scene-fx fx-top-right fx-gold" },
      { id: "mil-c", className: "scene-fx fx-hero-left fx-ribbon" },
      { id: "mil-d", className: "scene-fx fx-hero-right fx-gold" },
      { id: "mil-e", className: "scene-fx fx-lower-left fx-heart" },
      { id: "mil-f", className: "scene-fx fx-lower-right fx-gold" }
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
    ...SCENE_PRESETS.default,
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
      badge: `${togetherDays} DAY`,
      wallTitle: `给第 ${togetherDays} 天留一张记录卡`,
      composerTitle: `给第 ${togetherDays} 天落款`
    });
  }

  return buildSceneFromPreset("default", {
    title: profile.title || SCENE_PRESETS.default.title
  });
}

module.exports = {
  getSpecialScene
};
