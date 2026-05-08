const solarlunarPackage = require("solarlunar");
const solarlunar = solarlunarPackage.default || solarlunarPackage;
const { getTogetherDays } = require("./time");
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
  longlove: {
    key: "longlove",
    sceneClass: "scene-anniversary",
    badge: "久久日",
    title: "今天适合长久相爱",
    tag: "把长久和偏爱都写进今天。",
    description: "复用周年的金色仪式感，但不参与周年年数计算。",
    metricValue: "久久日",
    metricDesc: "适合许下长久",
    heroEyebrow: "LONG LOVE DAY",
    heroSubline: "把长长久久说得认真一点，也把今天好好收藏。",
    momentKicker: "久久此刻",
    wallKicker: "LONG LOVE NOTES",
    wallTitle: "给长久留一张记录卡",
    wallBody: "今天适合写下一句想一起走很久的话。",
    composerTitle: "写一句长久偏爱",
    composerBody: "把想一起慢慢走下去的心意，认真留在今天。",
    sceneMood: "ceremony",
    sceneIntensity: "special",
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
  qixi: {
    key: "qixi",
    sceneClass: "scene-valentine",
    badge: "七夕",
    title: "今天是七夕",
    tag: "把喜欢写得更认真一点。",
    description: "复用玫瑰色高光和花瓣粒子，让农历七夕更有告白氛围。",
    metricValue: "七夕",
    metricDesc: "适合认真说爱",
    heroEyebrow: "QIXI LETTER",
    heroSubline: "今天的喜欢，可以比平常更郑重一点。",
    momentKicker: "七夕此刻",
    wallKicker: "QIXI NOTES",
    wallTitle: "把七夕的爱意写下来",
    wallBody: "今天适合留一封更认真、更长久的告白。",
    composerTitle: "写一句七夕告白",
    composerBody: "把今晚的心动和想念，认真留在这一页。",
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
  winter: {
    key: "winter",
    sceneClass: "scene-christmas",
    badge: "冬日篇",
    title: "冬日温柔时刻",
    tag: "冬天很长，但有你就会暖一点。",
    description: "复用冬日冷调和暖光装饰，适合腊八等冬日日期。",
    metricValue: "冬日篇",
    metricDesc: "适合留住暖意",
    heroEyebrow: "WINTER WARMTH",
    heroSubline: "把冬天慢慢过暖，也把今天认真记下。",
    momentKicker: "冬日此刻",
    wallKicker: "WINTER NOTES",
    wallTitle: "把今天的暖意写下来",
    wallBody: "适合记录一碗热粥、一盏灯，和让人安心的陪伴。",
    composerTitle: "留一句冬日暖意",
    composerBody: "写下今天觉得温暖的瞬间，以后再读也会想靠近。",
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
  springfestival: {
    key: "springfestival",
    sceneClass: "scene-newyear",
    badge: "春节",
    title: "春节快乐",
    tag: "新的一岁，也想继续一起认真生活。",
    description: "复用新年烟火和节庆深色氛围，适合农历新年。",
    metricValue: "春节",
    metricDesc: "适合团圆与许愿",
    heroEyebrow: "SPRING FESTIVAL",
    heroSubline: "把新年的第一份认真和偏爱，都留给彼此。",
    momentKicker: "春节此刻",
    wallKicker: "SPRING NOTES",
    wallTitle: "给新的一岁留一句",
    wallBody: "把祝福、愿望和想一起继续生活的心意写下来。",
    composerTitle: "写一句新春心愿",
    composerBody: "适合写下感谢、期待，和新一年也想继续的喜欢。",
    sceneMood: "night-festival",
    sceneIntensity: "exact",
    orbMode: "firework",
    particleMode: "firework",
    chipStyle: "festival",
    badgeStyle: "seal"
  },
  lantern: {
    key: "lantern",
    sceneClass: "scene-newyear",
    badge: "元宵",
    title: "今天是元宵节",
    tag: "灯火和团圆，都适合留在今天。",
    description: "延续新年灯火氛围，让元宵节多一点团圆感。",
    metricValue: "元宵",
    metricDesc: "适合团圆与灯火",
    heroEyebrow: "LANTERN NIGHT",
    heroSubline: "灯火亮起来的时候，也适合把心里的话写下来。",
    momentKicker: "元宵此刻",
    wallKicker: "LANTERN NOTES",
    wallTitle: "把今晚的灯火写下来",
    wallBody: "适合记录团圆、热闹，和想一起看灯的心情。",
    composerTitle: "写一句元宵心愿",
    composerBody: "把今天的圆满和暖意，认真留在这一页。",
    sceneMood: "night-festival",
    sceneIntensity: "special",
    orbMode: "firework",
    particleMode: "firework",
    chipStyle: "festival",
    badgeStyle: "seal"
  },
  midautumn: {
    key: "midautumn",
    sceneClass: "scene-newyear",
    badge: "中秋",
    title: "今天是中秋节",
    tag: "月亮很好，想念和陪伴也都刚好。",
    description: "使用暖光夜景氛围，让中秋更适合团圆和记录。",
    metricValue: "中秋",
    metricDesc: "适合月色与团圆",
    heroEyebrow: "MID-AUTUMN MOON",
    heroSubline: "月色很亮，适合把想念和偏爱都说清楚。",
    momentKicker: "中秋此刻",
    wallKicker: "MOON NOTES",
    wallTitle: "把今天的月色写下来",
    wallBody: "适合记录月亮、团圆，和想一起慢慢走的心情。",
    composerTitle: "写一句中秋偏爱",
    composerBody: "把今天的想念和陪伴，认真留在这张月色卡片里。",
    sceneMood: "night-festival",
    sceneIntensity: "special",
    orbMode: "firework",
    particleMode: "firework",
    chipStyle: "festival",
    badgeStyle: "seal"
  },
  milestone: {
    key: "milestone",
    sceneClass: "scene-milestone",
    badge: "天数里程碑",
    title: "今天是特别的第 N 天",
    tag: "重要天数会自动触发纪念特效。",
    description: "在关键天数自动切换高亮主题，让数字本身变成纪念感。",
    metricValue: "天数里程碑",
    metricDesc: "重要天数已抵达",
    heroEyebrow: "MILESTONE UNLOCKED",
    heroSubline: "今天不是普通的一天，是值得被单独装订的一页。",
    momentKicker: "天数此刻",
    wallKicker: "DAY MILESTONE",
    wallTitle: "给这个特别天数留一张记录卡",
    wallBody: "有些天数天生值得单独收藏，今天就是其中一页。",
    composerTitle: "给这个特别天数落款",
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

function getStartDateParts(startTime) {
  const start = new Date(String(startTime || "").trim().replace(/-/g, "/"));

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  return getSolarDateParts(start);
}

function getAnniversaryOriginYear(profile, item) {
  const configuredYear = Number(item.originYear);
  if (configuredYear > 0) {
    return configuredYear;
  }

  if (item.calendar !== "solar") {
    return 0;
  }

  const startDate = getStartDateParts(profile.startTime);
  if (!startDate) {
    return 0;
  }

  const matchesStartDate = Number(item.month) === startDate.month && Number(item.day) === startDate.day;
  return matchesStartDate ? startDate.year : 0;
}

function getAnniversaryYears(profile, item, now) {
  const originYear = getAnniversaryOriginYear(profile, item);
  return originYear > 0 ? Math.max(0, now.getFullYear() - originYear) : 0;
}

function getAnniversaryKind(item) {
  const title = String(item.title || "");

  if (title.includes("恋爱")) {
    return "恋爱";
  }

  if (title.includes("结婚")) {
    return "结婚";
  }

  if (title.includes("领证")) {
    return "领证";
  }

  return "";
}

function getAnniversaryMetricLabel(item, years) {
  const kind = getAnniversaryKind(item);
  return kind ? `${kind} ${years} 周年` : `${years} 周年`;
}

function getAnniversaryTag(item, years) {
  const baseTag = String(item.tag || "").trim();
  const kind = getAnniversaryKind(item);
  const yearText = kind ? `${kind}第 ${years} 周年` : `第 ${years} 周年`;

  if (baseTag) {
    return `${baseTag} ${yearText}准时抵达。`;
  }

  return `这是我们的${yearText}。`;
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

  const configuredScene = matchConfiguredScene(profile, now);
  if (configuredScene) {
    const presetKey = configuredScene.key || "default";
    const sceneOverrides = {
      ...configuredScene
    };

    if (presetKey === "anniversary") {
      const anniversaryYears = getAnniversaryYears(profile, configuredScene, now);

      if (anniversaryYears > 0) {
        const anniversaryLabel = getAnniversaryMetricLabel(configuredScene, anniversaryYears);
        sceneOverrides.anniversaryYears = anniversaryYears;
        sceneOverrides.tag = getAnniversaryTag(configuredScene, anniversaryYears);
        sceneOverrides.badge = sceneOverrides.badge || anniversaryLabel;
        sceneOverrides.metricValue = sceneOverrides.metricValue || anniversaryLabel;
        sceneOverrides.metricDesc = sceneOverrides.metricDesc || "日期周年已抵达";
        sceneOverrides.wallTitle = sceneOverrides.wallTitle || `给${anniversaryLabel}留一张纪念卡`;
        sceneOverrides.composerTitle = sceneOverrides.composerTitle || `给${anniversaryLabel}落款`;
      }
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
