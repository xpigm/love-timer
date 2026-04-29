const { DEFAULT_QUOTES } = require("../../utils/default-data");
const profileUtils = require("../../utils/profile-config");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

function buildTodayLabel() {
  return time.formatDate(new Date()).replace(/-/g, ".");
}

function buildWallMeta(notes, scene) {
  const hasSpecialScene = scene && scene.key && scene.key !== "default";

  return {
    badge: hasSpecialScene ? scene.badge || scene.title || "" : "",
    date: buildTodayLabel(),
    kicker: "MEMORY WALL",
    status: notes.length ? `${notes.length} 条留言` : "还没有留言",
    streamHint: notes.length ? "新的在上面" : "等第一条出现",
    empty: "还没有留下内容，写下第一条留言吧。"
  };
}

function buildWallHero(profile, notes, scene) {
  return {
    title: notes.length ? "把想说的话慢慢留下来" : "从第一句话开始记录",
    body: notes.length
      ? `这里收着 ${profile.personA} 和 ${profile.personB} 留下来的片段。${scene.tag || scene.description || "有些话写下来，会比当下更久。"}`
      : `${scene.tag ? `${scene.tag} ` : ""}现在写下的第一句话，以后会变成最早的一张纪念卡。`,
    coverline: notes.length ? `最近更新于 ${notes[0].createdAt}` : `${profile.personA} · ${profile.personB}`
  };
}

function buildComposerPanel(scene, notes) {
  return {
    title: notes.length ? "继续写一条" : "写下第一条",
    body: notes.length
      ? "不需要很长，把这一刻想留住的话写下来就好。"
      : `${scene.tag ? `${scene.tag} ` : ""}先记一句，留言墙就会从这里开始。`,
    helper: "最多 300 字，适合写一句话、一个心情，或者今天的小瞬间。"
  };
}

const NAVIGATION_THEME = {
  midnight: {
    frontColor: "#ffffff",
    backgroundColor: "#151327"
  },
  blush: {
    frontColor: "#000000",
    backgroundColor: "#fff7f4"
  }
};

function tapFeedback() {
  if (wx.vibrateShort) {
    wx.vibrateShort({ type: "light" });
  }
}

function syncNavigationBar(theme) {
  if (!wx.setNavigationBarColor) {
    return;
  }

  const systemInfo = wx.getSystemInfoSync();
  if (systemInfo.theme === "dark") {
    wx.setNavigationBarColor(NAVIGATION_THEME.midnight);
  } else {
    const navigationTheme = NAVIGATION_THEME[theme] || NAVIGATION_THEME.blush;
    wx.setNavigationBarColor(navigationTheme);
  }
}

function decorateNotes(notes) {
  return notes.map((note, index) => ({
    ...note,
    isLatest: index === 0,
    metaLine: note.author ? `${note.author} · ${note.createdAt}` : note.createdAt
  }));
}

function buildWallViewData(profile, scene, notes, authorOptions, options = {}) {
  const authorIndex = Number.isInteger(options.authorIndex) ? options.authorIndex : 0;
  const content = options.content == null ? "" : options.content;
  const nextAuthor = authorOptions[authorIndex] || authorOptions[0] || "";

  return {
    themeClass: `theme-${profile.theme || "blush"}`,
    profile,
    scene,
    authorOptions,
    authorIndex,
    form: {
      author: nextAuthor,
      content
    },
    notes: decorateNotes(notes),
    noteCount: notes.length,
    wallMeta: buildWallMeta(notes, scene),
    wallHero: buildWallHero(profile, notes, scene),
    composerPanel: buildComposerPanel(scene, notes)
  };
}

Page({
  data: {
    themeClass: "theme-blush",
    profile: {},
    scene: {
      title: "",
      tag: "",
      badge: "",
      description: "",
      chips: [],
      metricValue: "",
      metricDesc: ""
    },
    authorOptions: [],
    authorIndex: 0,
    form: {
      author: "",
      content: ""
    },
    notes: [],
    noteCount: 0,
    wallMeta: {
      badge: "",
      date: "",
      kicker: "",
      status: "",
      streamHint: "",
      empty: ""
    },
    wallHero: {
      title: "",
      body: "",
      coverline: ""
    },
    composerPanel: {
      title: "",
      body: "",
      helper: ""
    }
  },

  onLoad() {
    if (wx.onThemeChange) {
      wx.onThemeChange(() => {
        this.loadData();
      });
    }
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = profileUtils.getProfile();
    const scene = time.getSpecialScene(profile);
    syncNavigationBar(profile.theme);
    const authorOptions = [profile.personA, profile.personB, "匿名"].filter(Boolean);
    const notes = storage.getNotes();

    this.setData(buildWallViewData(profile, scene, notes, authorOptions));
  },

  onAuthorChange(event) {
    tapFeedback();
    const authorIndex = Number(event.detail.value);

    this.setData({
      authorIndex,
      "form.author": this.data.authorOptions[authorIndex]
    });
  },

  onContentInput(event) {
    this.setData({
      "form.content": event.detail.value
    });
  },

  fillInspiration() {
    tapFeedback();
    const text = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)].trim();
    const content = this.data.form.content ? `${this.data.form.content}\n${text}` : text;

    this.setData({
      "form.content": content
    });
  },

  submitNote() {
    const author = this.data.form.author || this.data.authorOptions[0];
    const content = (this.data.form.content || "").trim();

    if (!content) {
      wx.showToast({
        title: "先写点内容吧",
        icon: "none"
      });
      return;
    }

    const note = {
      id: storage.createId("note"),
      author,
      content,
      createdAt: time.formatDateTime(new Date()),
      timestamp: Date.now()
    };

    const notes = storage.appendNote(note);

    this.setData(
      buildWallViewData(this.data.profile, this.data.scene, notes, this.data.authorOptions, {
        authorIndex: 0,
        content: ""
      })
    );

    tapFeedback();

    wx.showToast({
      title: "留言已保存",
      icon: "success"
    });
  },

  copyNote(event) {
    const { content } = event.currentTarget.dataset;
    wx.setClipboardData({
      data: content
    });
  },

  deleteNote(event) {
    const { id } = event.currentTarget.dataset;

    wx.showModal({
      title: "删除留言",
      content: "删除后无法恢复，确认继续吗？",
      success: ({ confirm }) => {
        if (!confirm) {
          return;
        }

        const notes = storage.deleteNote(id);
        this.setData(
          buildWallViewData(this.data.profile, this.data.scene, notes, this.data.authorOptions, {
            authorIndex: this.data.authorIndex,
            content: this.data.form.content
          })
        );

        wx.showToast({
          title: "已删除",
          icon: "success"
        });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.profile.personA}和${this.data.profile.personB}的留言墙`,
      path: "/pages/wall/wall"
    };
  }
});
