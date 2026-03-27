const { DEFAULT_QUOTES } = require("../../utils/default-data");
const profileUtils = require("../../utils/profile-config");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

const NOTE_CARD_CLASSES = ["pin-left", "pin-right", "pin-flat"];

function decorateNotes(notes) {
  return notes.map((note, index) => ({
    ...note,
    cardClass: NOTE_CARD_CLASSES[index % NOTE_CARD_CLASSES.length],
    stamp: index === 0 ? "LATEST" : `MEMO 0${index + 1}`
  }));
}

function buildBoardTags(profile, notes) {
  const tags = [
    profile.city ? `${profile.city} 恋爱现场` : "",
    `${notes.length} 条悄悄话`,
    notes.length ? "持续更新中" : "等你写下第一条"
  ];

  return tags.filter(Boolean);
}

function buildLatestNoteLabel(notes) {
  return notes.length ? `最近更新于 ${notes[0].createdAt}` : "今天很适合写第一句悄悄话";
}

function buildTodayLabel() {
  return time.formatDate(new Date()).replace(/-/g, ".");
}

Page({
  data: {
    themeClass: "theme-blush",
    profile: {},
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
    todayLabel: ""
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = profileUtils.getProfile();
    const authorOptions = [profile.personA, profile.personB, "匿名"].filter(Boolean);
    const notes = storage.getNotes();

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      profile,
      authorOptions,
      authorIndex: 0,
      notes: decorateNotes(notes),
      noteCount: notes.length,
      latestNoteLabel: buildLatestNoteLabel(notes),
      boardTags: buildBoardTags(profile, notes),
      todayLabel: buildTodayLabel(),
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
          todayLabel: buildTodayLabel()
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
