const { DEFAULT_QUOTES } = require("../../utils/default-data");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

function buildStats(profile, duration, notesCount, memoriesCount, nextMilestones) {
  return [
    {
      label: "一起走过",
      value: `${duration.days} 天`,
      desc: "把喜欢过成日常"
    },
    {
      label: "下个节点",
      value: nextMilestones.length ? `${nextMilestones[0].day} 天` : "已解锁",
      desc: nextMilestones.length ? nextMilestones[0].leftText : "继续创造新的纪念"
    },
    {
      label: "留言数量",
      value: `${notesCount} 条`,
      desc: "把想说的话留下来"
    },
    {
      label: "纪念片段",
      value: `${memoriesCount} 条`,
      desc: profile.city || "记录你们的故事"
    }
  ];
}

Page({
  data: {
    themeClass: "theme-blush",
    profile: {},
    quote: "",
    timer: {
      days: "0",
      hours: "00",
      minutes: "00",
      seconds: "00"
    },
    stats: [],
    specialTitle: "",
    specialTag: "",
    nextMilestones: [],
    notesPreview: [],
    notesCount: 0,
    memoriesPreview: [],
    memoriesCount: 0
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

  loadPageData(keepQuote = false) {
    const profile = storage.getProfile();
    const notes = storage.getNotes();
    const memories = storage.getMemories();
    const duration = time.getDuration(profile.startDate);
    const nextMilestones = time.getUpcomingMilestones(profile.startDate);
    const specialMoment = time.getSpecialMoment(profile);

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      profile,
      quote: keepQuote && this.data.quote ? this.data.quote : this.pickQuote(),
      timer: duration,
      specialTitle: specialMoment.title,
      specialTag: specialMoment.tag,
      nextMilestones,
      notesPreview: notes.slice(0, 3),
      notesCount: notes.length,
      memoriesPreview: memories.slice(0, 4),
      memoriesCount: memories.length,
      stats: buildStats(profile, duration, notes.length, memories.length, nextMilestones)
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
    const profile = this.data.profile.personA ? this.data.profile : storage.getProfile();
    const duration = time.getDuration(profile.startDate);
    const nextMilestones = time.getUpcomingMilestones(profile.startDate);
    const specialMoment = time.getSpecialMoment(profile);

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      timer: duration,
      nextMilestones,
      specialTitle: specialMoment.title,
      specialTag: specialMoment.tag,
      stats: buildStats(
        profile,
        duration,
        this.data.notesCount,
        this.data.memoriesCount,
        nextMilestones
      )
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

  openSettings() {
    wx.navigateTo({
      url: "/pages/settings/settings"
    });
  },

  copySummary() {
    const { profile, timer } = this.data;
    const summary = `${profile.personA}和${profile.personB}已经相恋 ${timer.days} 天 ${timer.hours} 小时 ${timer.minutes} 分 ${timer.seconds} 秒。`;

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
    const { profile, timer } = this.data;
    return {
      title: `${profile.personA}和${profile.personB}的恋爱纪念册 · 第 ${timer.days} 天`
    };
  }
});
