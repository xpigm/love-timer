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
      label: "星轨延伸",
      value: `${duration.days} 天`,
      desc: "心动有了光年长度"
    },
    {
      label: "引力公转",
      value: `第 ${loveYears + 1} 年`,
      desc: loveYears > 0 ? `已完成 ${loveYears} 次浪漫绕行` : "航行日记刚刚开启"
    },
    {
      label: "记忆碎片",
      value: `${notesCount} 枚`,
      desc: notesCount ? "星云深处藏着悄悄话" : "这片星空正等第一颗星点亮"
    }
  ];
}

function decorateNotes(notes) {
  return notes.slice(0, 2).map((note, index) => ({
    ...note,
    cardClass: NOTE_CARD_CLASSES[index % NOTE_CARD_CLASSES.length],
    noteLabel: index === 0 ? "ECHO 01" : "ECHO 02"
  }));
}

function buildCoverTags(profile, scene) {
  return [profile.city ? `${profile.city} 观测站` : "专属星系"].filter(Boolean);
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
    title: scene.title || "星空寄语",
    body: `${scene.tag ? scene.tag + ' ' : ''}${quoteText}`,
    aside: notesCount
      ? `已经收集了 ${notesCount} 枚记忆碎片，今晚的月色同样值得刻印。`
      : "深空静谧，正适合刻印下你们的第一条专属信号。"
  };
}

function buildCoverLine(profile, duration) {
  return `第 ${duration.days} 天，引力依旧同频`;
}

function buildDateMeta(profile) {
  return [
    {
      label: "信号源起",
      value: formatStartDateLabel(profile.startTime)
    }
  ];
}

function buildSpotlight(profile, scene, notesCount) {
  return {
    title: notesCount ? "今夜截获的信号" : "预留一个时空坐标",
    body: notesCount
      ? "留下来的，是宇宙中唯一不会随光年衰减的心跳证据。"
      : `${scene.tag ? scene.tag + ' ' : ''}不必等特殊天文现象，今天就能发送第一组波段。`,
    cta: notesCount ? "发射新信号" : "建立首次连接",
    footnote: `${profile.personA} ✧ ${profile.personB}`
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
