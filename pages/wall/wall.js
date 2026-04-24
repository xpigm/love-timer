const { DEFAULT_QUOTES } = require("../../utils/default-data");
const profileUtils = require("../../utils/profile-config");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

const NOTE_CARD_CLASSES = ["pin-left", "pin-right", "pin-flat"];

function decorateNotes(notes) {
  return notes.map((note, index) => ({
    ...note,
    cardClass: NOTE_CARD_CLASSES[index % NOTE_CARD_CLASSES.length],
    stamp: index === 0 ? "LATEST" : `MEMO ${String(index + 1).padStart(2, "0")}`
  }));
}

function buildBoardTags(profile, notes) {
  const tags = [
    profile.city ? `${profile.city}` : "两个人的留言",
    `${notes.length} 条留言`,
    notes.length ? "持续更新中" : "等你们写下第一句"
  ];

  return tags.filter(Boolean);
}

function buildLatestNoteLabel(notes) {
  return notes.length ? `最近更新于 ${notes[0].createdAt}` : "还没有留言，先写下今天想说的话吧";
}

function buildTodayLabel() {
  return time.formatDate(new Date()).replace(/-/g, ".");
}

function buildWallSummary(profile, notes, scene) {
  return {
    title: notes.length ? "把想说的话慢慢留下来" : "从第一张卡片开始记录",
    body: notes.length
      ? `这里收着 ${profile.personA} 和 ${profile.personB} 留下来的片段。${scene.description || "有些话写下来，会比当下更久。"}`
      : `${scene.tag ? scene.tag + " " : ""}现在写下的第一句话，以后会变成最早的一张纪念卡。`,
    footnote: notes.length
      ? `最近更新于 ${notes[0].createdAt}`
      : `${profile.personA} · ${profile.personB}`
  };
}

function buildWallStats(profile, notes) {
  const togetherDays = time.getTogetherDays(profile.startTime);
  const loveYears = time.getLoveYears(profile.startTime);

  return [
    {
      label: "一起走过",
      value: `${togetherDays} 天`
    },
    {
      label: "第几年",
      value: `第 ${loveYears + 1} 年`
    },
    {
      label: "已收藏",
      value: `${notes.length} 条`
    }
  ];
}

function buildComposerHint(scene, notes) {
  return {
    title: notes.length ? "写一张新卡片" : "写下第一张卡片",
    body: notes.length
      ? "不需要很长，只要把此刻想留住的话写下来。"
      : `${scene.tag ? scene.tag + " " : ""}先记一句，纪念册就会从这里开始。`,
    helper: "最多 300 字，适合写一句话、一个心情，或者今天的小瞬间。"
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
    latestNoteLabel: "",
    boardTags: [],
    todayLabel: "",
    wallSummary: {
      title: "",
      body: "",
      footnote: ""
    },
    wallStats: [],
    composerHint: {
      title: "",
      body: "",
      helper: ""
    }
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = profileUtils.getProfile();
    const scene = time.getSpecialScene(profile);
    const authorOptions = [profile.personA, profile.personB, "匿名"].filter(Boolean);
    const notes = storage.getNotes();

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      profile,
      scene,
      authorOptions,
      authorIndex: 0,
      notes: decorateNotes(notes),
      noteCount: notes.length,
      latestNoteLabel: buildLatestNoteLabel(notes),
      boardTags: buildBoardTags(profile, notes),
      todayLabel: buildTodayLabel(),
      wallSummary: buildWallSummary(profile, notes, scene),
      wallStats: buildWallStats(profile, notes),
      composerHint: buildComposerHint(scene, notes),
      form: {
        author: authorOptions[0],
        content: ""
      }
    });
  },

  onAuthorChange(event) {
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

    this.setData({
      notes: decorateNotes(notes),
      noteCount: notes.length,
      latestNoteLabel: buildLatestNoteLabel(notes),
      boardTags: buildBoardTags(this.data.profile, notes),
      todayLabel: buildTodayLabel(),
      wallSummary: buildWallSummary(this.data.profile, notes, this.data.scene),
      wallStats: buildWallStats(this.data.profile, notes),
      composerHint: buildComposerHint(this.data.scene, notes),
      authorIndex: 0,
      form: {
        author: this.data.authorOptions[0],
        content: ""
      }
    });

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
        this.setData({
          notes: decorateNotes(notes),
          noteCount: notes.length,
          latestNoteLabel: buildLatestNoteLabel(notes),
          boardTags: buildBoardTags(this.data.profile, notes),
          todayLabel: buildTodayLabel(),
          wallSummary: buildWallSummary(this.data.profile, notes, this.data.scene),
          wallStats: buildWallStats(this.data.profile, notes),
          composerHint: buildComposerHint(this.data.scene, notes)
        });

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
