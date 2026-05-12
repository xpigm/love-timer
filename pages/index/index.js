const { DEFAULT_QUOTES, MEMORY_PROMPTS } = require("../../utils/default-data");
const milestone = require("../../utils/milestone");
const noteService = require("../../utils/note-service");
const profileUtils = require("../../utils/profile-config");
const specialScene = require("../../utils/special-scene");
const time = require("../../utils/time");
const ui = require("../../utils/ui");

function formatStartDateLabel(startTime) {
  return String(startTime || "")
    .split(" ")[0]
    .replace(/-/g, ".");
}

function decorateRecentNotes(notes) {
  return notes.slice(0, 3).map((note) => ({
    ...note,
    preview: String(note.content || "").trim(),
    previewMeta: note.author ? `${note.author} · ${note.createdAt}` : note.createdAt
  }));
}

function pickMemoryPrompt(current = "") {
  let next = MEMORY_PROMPTS[Math.floor(Math.random() * MEMORY_PROMPTS.length)] || "";

  if (MEMORY_PROMPTS.length > 1) {
    while (next === current) {
      next = MEMORY_PROMPTS[Math.floor(Math.random() * MEMORY_PROMPTS.length)] || "";
    }
  }

  return next;
}

function buildCoverTags(profile, scene) {
  return [profile.city ? `${profile.city}` : "两个人的日常"].filter(Boolean);
}

function buildSpecialLabel(scene) {
  if (!scene || scene.key === "default") {
    return "";
  }

  return scene.badge || scene.title || "";
}

function buildMomentPanel(profile, scene, quote, duration) {
  const sceneTag = String(scene.tag || "").trim();
  const quoteText = String(quote || "今天也值得认真记一下。").trim();
  const hasSpecialScene = scene && scene.key && scene.key !== "default";

  return {
    badge: buildSpecialLabel(scene),
    kicker: scene.momentKicker || "今日此刻",
    title: hasSpecialScene ? scene.title || "" : "",
    body: sceneTag ? `${sceneTag} ${quoteText}` : quoteText,
    actionLabel: "换一句"
  };
}

function buildCoverLine(profile, duration) {
  return `已经一起 ${duration.days} 天了`;
}

function buildDateMeta(profile) {
  return [
    {
      label: "开始于",
      value: formatStartDateLabel(profile.startTime)
    }
  ];
}

function buildSpotlight(notes) {
  const notesCount = notes.length;

  return {
    status: notesCount ? `${notesCount} 条留言` : "还没有留言",
    entry: notesCount ? "查看留言墙 →" : "去写留言 →",
    empty: "先写下今天的第一句话吧。"
  };
}

function buildTimerRefreshKey(duration) {
  return `${duration.days}-${duration.hours}-${duration.minutes}`;
}

function buildSceneRefreshKey(scene, milestoneBadge, duration) {
  return [
    scene.key || "default",
    scene.title || "",
    milestoneBadge.badgeText || "",
    milestoneBadge.label || "",
    duration.days
  ].join("|");
}

function buildHeroMilestone(milestoneBadge) {
  if (!milestoneBadge || !milestoneBadge.visible) {
    return {
      visible: false,
      chip: "",
      text: "",
      exact: false
    };
  }

  if (milestoneBadge.isExactMilestone) {
    return {
      visible: true,
      chip: `${milestoneBadge.currentDays} DAY`,
      text: `${milestoneBadge.label} 已抵达`,
      exact: true
    };
  }

  if (milestoneBadge.next) {
    return {
      visible: true,
      chip: milestoneBadge.badgeText === "2000+ DAYS" ? "2000+ DAYS" : "NEXT",
      text: `距 ${milestoneBadge.next.label} 还有 ${milestoneBadge.next.remainingDays} 天`,
      exact: false
    };
  }

  return {
    visible: true,
    chip: milestoneBadge.badgeText || "MILESTONE",
    text: milestoneBadge.description || milestoneBadge.label,
    exact: false
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
    momentPanel: {
      badge: "",
      kicker: "",
      title: "",
      body: "",
      actionLabel: ""
    },
    specialLabel: "",
    memoryPrompt: "",
    spotlight: {
      status: "",
      entry: "",
      empty: ""
    },
    recentNotes: [],
    scene: {
      title: "",
      tag: "",
      badge: "",
      description: "",
      metricValue: "",
      metricDesc: ""
    },
    milestoneBadge: {
      visible: false,
      isExactMilestone: false,
      badgeText: "",
      label: "",
      description: "",
      accentText: "",
      currentDays: 0,
      next: null
    },
    heroMilestone: {
      visible: false,
      chip: "",
      text: "",
      exact: false
    },
    sceneDecorations: [],
    notesCount: 0,
    lastSceneRefreshKey: ""
  },

  onLoad() {
    wx.showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"]
    });
    this.loadPageData();

    ui.bindThemeChange(this, () => {
      this.loadPageData(true);
    });
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
    ui.unbindThemeChange(this);
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
    const duration = time.getDuration(profile.startTime);
    const scene = specialScene.getSpecialScene(profile);
    const milestoneBadge = milestone.getMilestoneBadgeData(profile.startTime);

    return {
      profile,
      duration,
      scene,
      milestoneBadge
    };
  },

  async loadPageData(keepQuote = false) {
    const { profile, duration, scene, milestoneBadge } = this.getBaseData();
    const quote = keepQuote && this.data.quote ? this.data.quote : this.pickQuote();
    const memoryPrompt = keepQuote && this.data.memoryPrompt ? this.data.memoryPrompt : pickMemoryPrompt(this.data.memoryPrompt);
    let notes = [];

    try {
      notes = await noteService.fetchNotes();
    } catch (error) {
      notes = [];
    }

    ui.syncNavigationBar(profile.theme);

    const refreshKey = buildSceneRefreshKey(scene, milestoneBadge, duration);

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
      momentPanel: buildMomentPanel(profile, scene, quote, duration),
      specialLabel: buildSpecialLabel(scene),
      memoryPrompt,
      spotlight: buildSpotlight(notes),
      recentNotes: decorateRecentNotes(notes),
      scene,
      milestoneBadge,
      heroMilestone: buildHeroMilestone(milestoneBadge),
      sceneDecorations: scene.decorations || [],
      notesCount: notes.length,
      lastSceneRefreshKey: refreshKey
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
    const nextRefreshKey = buildTimerRefreshKey(duration);

    if (this.timerRefreshKey === nextRefreshKey) {
      this.setData({
        "timer.seconds": duration.seconds
      });
      return;
    }

    this.timerRefreshKey = nextRefreshKey;

    const scene = specialScene.getSpecialScene(profile);
    const milestoneBadge = milestone.getMilestoneBadgeData(profile.startTime);
    const sceneRefreshKey = buildSceneRefreshKey(scene, milestoneBadge, duration);
    const sceneChanged = sceneRefreshKey !== this.data.lastSceneRefreshKey;
    const nextData = {
      timer: duration,
      coverLine: buildCoverLine(profile, duration),
      momentPanel: buildMomentPanel(profile, sceneChanged ? scene : this.data.scene, this.data.quote, duration)
    };

    if (sceneChanged) {
      Object.assign(nextData, {
        themeClass: `theme-${profile.theme || "blush"}`,
        sceneClass: scene.sceneClass || "scene-default",
        startDateLabel: formatStartDateLabel(profile.startTime),
        coverTags: buildCoverTags(profile, scene),
        dateMeta: buildDateMeta(profile),
        specialLabel: buildSpecialLabel(scene),
        scene,
        milestoneBadge,
        heroMilestone: buildHeroMilestone(milestoneBadge),
        sceneDecorations: scene.decorations || [],
        lastSceneRefreshKey: sceneRefreshKey
      });
    }

    this.setData(nextData);
  },

  refreshQuote() {
    ui.tapFeedback();
    const quote = this.pickQuote();

    this.setData({
      quote,
      momentPanel: buildMomentPanel(this.data.profile, this.data.scene, quote, this.data.timer)
    });
  },

  openWall() {
    wx.navigateTo({
      url: "/pages/wall/wall"
    });
  },

  copySummary() {
    const { profile, timer, momentPanel } = this.data;
    const summary =
      `${profile.personA}和${profile.personB}已经相恋 ${timer.days} 天 ${timer.hours} 小时 ` +
      `${timer.minutes} 分 ${timer.seconds} 秒。${momentPanel.title}，${momentPanel.body}`;

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
      title: `${profile.personA}和${profile.personB}的恋爱纪念册 · 第 ${timer.days} 天 · ${scene.title}`
    };
  }
});
