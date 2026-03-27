const { DEFAULT_QUOTES } = require("../../utils/default-data");
const profileUtils = require("../../utils/profile-config");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

function buildStats(duration, notesCount, loveYears, scene) {
  return [
    {
      label: "一起走过",
      value: `${duration.days} 天`,
      desc: "把喜欢过成日常"
    },
    {
      label: "恋爱阶段",
      value: `第 ${loveYears + 1} 年`,
      desc: loveYears > 0 ? `已经走过 ${loveYears} 个完整周年` : "热恋故事刚刚写下开头"
    },
    {
      label: "留言数量",
      value: `${notesCount} 条`,
      desc: "把想说的话认真留下来"
    },
    {
      label: "今日氛围",
      value: scene.metricValue,
      desc: scene.metricDesc
    }
  ];
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
    stats: [],
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

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      sceneClass: scene.sceneClass || "scene-default",
      profile,
      quote: keepQuote && this.data.quote ? this.data.quote : this.pickQuote(),
      timer: duration,
      scene,
      sceneDecorations: scene.decorations || [],
      notesPreview: notes.slice(0, 3),
      notesCount: notes.length,
      stats: buildStats(duration, notes.length, loveYears, scene)
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
      scene,
      sceneDecorations: scene.decorations || [],
      stats: buildStats(duration, this.data.notesCount, loveYears, scene)
    });
  },

  refreshQuote() {
    this.setData({
      quote: this.pickQuote()
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
