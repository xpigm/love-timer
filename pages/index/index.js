const { DEFAULT_QUOTES } = require("../../utils/default-data");
const profileUtils = require("../../utils/profile-config");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

const NOTE_CARD_CLASSES = ["note-card-primary", "note-card-secondary"];

function formatStartDateLabel(startTime) {
  return String(startTime || "")
    .split(" ")[0]
    .replace(/-/g, ".");
}

function buildQuickStats(duration, notesCount, loveYears) {
  return [
    {
      label: "一起走过",
      value: `${duration.days} 天`,
      desc: "喜欢已经有了长度"
    },
    {
      label: "恋爱章节",
      value: `第 ${loveYears + 1} 年`,
      desc: loveYears > 0 ? `已经跨过 ${loveYears} 个完整周年` : "故事刚刚写下序章"
    },
    {
      label: "留存记录",
      value: `${notesCount} 条`,
      desc: notesCount ? "有些话已经被认真收藏" : "还等着第一条被写下"
    }
  ];
}

function decorateNotes(notes) {
  return notes.slice(0, 2).map((note, index) => ({
    ...note,
    cardClass: NOTE_CARD_CLASSES[index % NOTE_CARD_CLASSES.length],
    noteLabel: index === 0 ? "RECENT 01" : "RECENT 02"
  }));
}

function buildCoverTags(profile, scene) {
  return [profile.city].filter(Boolean);
}

function buildSpecialLabel(scene) {
  if (!scene || scene.key === "default") {
    return "";
  }

  return scene.badge || scene.title || "";
}

function buildSummary(profile, scene, quote, notesCount) {
  const quoteText = quote || "把普通日子过成纪念日。";

  return {
    eyebrow: buildSpecialLabel(scene),
    title: scene.title,
    body: `${scene.tag} ${quoteText}`,
    aside: notesCount
      ? `我们已经留下 ${notesCount} 条记录，今天也值得再写下一条。`
      : "还没有太多存档，但今天就很适合写下第一条。"
  };
}

function buildCoverLine(profile, duration) {
  return `第 ${duration.days} 天，喜欢还在增量`;
}

function buildDateMeta(profile) {
  return [
    {
      label: "开始于",
      value: formatStartDateLabel(profile.startTime)
    }
  ];
}

function buildSpotlight(profile, scene, notesCount) {
  return {
    title: notesCount ? "今天想收藏的话" : "今天先留一个位置",
    body: notesCount
      ? "留下来的，不只是记录，更是之后回看时仍会心动的证据。"
      : `${scene.tag} 不必等特别日子，今天就可以开始记录。`,
    cta: notesCount ? "继续写一条新的" : "写下第一条留言",
    footnote: `${profile.personA} / ${profile.personB}`
  };
}

Page({
  data: {
    themeClass: "theme-blush",
    sceneClass: "scene-default",
    profile: {},
    quote: "",
    timer: {
      days: "0",
      hours: "00",
      minutes: "00",
      seconds: "00"
    },
    coverLine: "",
    startDateLabel: "",
    coverTags: [],
    dateMeta: [],
    quickStats: [],
    summary: {
      eyebrow: "",
      title: "",
      body: "",
      aside: ""
    },
    specialLabel: "",
    spotlight: {
      title: "",
      body: "",
      cta: "",
      footnote: ""
    },
    scene: {
      title: "",
      tag: "",
      badge: "",
      description: "",
      chips: [],
      metricValue: "",
      metricDesc: ""
    },
    sceneDecorations: [],
    notesPreview: [],
    notesCount: 0
  },

  onLoad() {
    wx.showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"]
    });
    this.loadPageData();
  },

  onShow() {
    this.loadPageData(true);
    this.startTimer();
  },

  onHide() {
    this.stopTimer();
  },

  onUnload() {
    this.stopTimer();
  },

  pickQuote() {
    const current = this.data.quote;
    let next = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

    if (DEFAULT_QUOTES.length > 1) {
      while (next === current) {
        next = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
      }
    }

    return next.trim();
  },

  getBaseData() {
    const profile = profileUtils.getProfile();
    const notes = storage.getNotes();
    const duration = time.getDuration(profile.startTime);
    const loveYears = time.getLoveYears(profile.startTime);
    const scene = time.getSpecialScene(profile);

    return {
      profile,
      notes,
      duration,
      loveYears,
      scene
    };
  },

  loadPageData(keepQuote = false) {
    const { profile, notes, duration, loveYears, scene } = this.getBaseData();
    const quote = keepQuote && this.data.quote ? this.data.quote : this.pickQuote();

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      sceneClass: scene.sceneClass || "scene-default",
      profile,
      quote,
      timer: duration,
      coverLine: buildCoverLine(profile, duration),
      startDateLabel: formatStartDateLabel(profile.startTime),
      coverTags: buildCoverTags(profile, scene),
      dateMeta: buildDateMeta(profile),
      quickStats: buildQuickStats(duration, notes.length, loveYears),
      summary: buildSummary(profile, scene, quote, notes.length),
      specialLabel: buildSpecialLabel(scene),
      spotlight: buildSpotlight(profile, scene, notes.length),
      scene,
      sceneDecorations: scene.decorations || [],
      notesPreview: decorateNotes(notes),
      notesCount: notes.length
    });
  },

  startTimer() {
    this.stopTimer();
    this.updateTimer();
    this.timerId = setInterval(() => {
      this.updateTimer();
    }, 1000);
  },

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  updateTimer() {
    const profile = this.data.profile.personA ? this.data.profile : profileUtils.getProfile();
    const duration = time.getDuration(profile.startTime);
    const loveYears = time.getLoveYears(profile.startTime);
    const scene = time.getSpecialScene(profile);

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      sceneClass: scene.sceneClass || "scene-default",
      timer: duration,
      coverLine: buildCoverLine(profile, duration),
      startDateLabel: formatStartDateLabel(profile.startTime),
      coverTags: buildCoverTags(profile, scene),
      dateMeta: buildDateMeta(profile),
      quickStats: buildQuickStats(duration, this.data.notesCount, loveYears),
      summary: buildSummary(profile, scene, this.data.quote, this.data.notesCount),
      specialLabel: buildSpecialLabel(scene),
      spotlight: buildSpotlight(profile, scene, this.data.notesCount),
      scene,
      sceneDecorations: scene.decorations || []
    });
  },

  refreshQuote() {
    const quote = this.pickQuote();

    this.setData({
      quote,
      summary: buildSummary(this.data.profile, this.data.scene, quote, this.data.notesCount)
    });
  },

  openWall() {
    wx.navigateTo({
      url: "/pages/wall/wall"
    });
  },

  copySummary() {
    const { profile, timer, scene } = this.data;
    const summary =
      `${profile.personA}和${profile.personB}已经相恋 ${timer.days} 天 ${timer.hours} 小时 ` +
      `${timer.minutes} 分 ${timer.seconds} 秒。${scene.title}，${scene.tag}`;

    wx.setClipboardData({
      data: summary,
      success: () => {
        wx.showToast({
          title: "已复制纪念文案",
          icon: "success"
        });
      }
    });
  },

  onShareAppMessage() {
    const { profile, timer } = this.data;
    return {
      title: `${profile.personA}和${profile.personB}已经相恋 ${timer.days} 天`,
      path: "/pages/index/index"
    };
  },

  onShareTimeline() {
    const { profile, timer, scene } = this.data;
    return {
      title: `${profile.personA}和${profile.personB}的恋爱纪念册 · 第 ${timer.days} 天 · ${scene.badge}`
    };
  }
});
