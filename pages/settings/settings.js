const {
  DEFAULT_PROFILE,
  THEME_OPTIONS
} = require("../../utils/default-data");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

Page({
  data: {
    themeClass: "theme-blush",
    profile: {},
    themeOptions: THEME_OPTIONS,
    themeIndex: 0,
    memories: [],
    memoryForm: {
      date: "",
      title: "",
      content: ""
    }
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const profile = storage.getProfile();
    const memories = storage.getMemories();
    const themeIndex = Math.max(
      0,
      this.data.themeOptions.findIndex((item) => item.value === profile.theme)
    );

    this.setData({
      themeClass: `theme-${profile.theme || "blush"}`,
      profile,
      memories,
      themeIndex,
      memoryForm: {
        date: time.formatDate(new Date()),
        title: "",
        content: ""
      }
    });
  },

  onProfileInput(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`profile.${field}`]: event.detail.value
    });
  },

  onStartDateChange(event) {
    this.setData({
      "profile.startDate": event.detail.value
    });
  },

  onThemeChange(event) {
    const themeIndex = Number(event.detail.value);
    this.setData({
      themeIndex,
      "profile.theme": this.data.themeOptions[themeIndex].value
    });
  },

  saveProfile() {
    const profile = {
      ...DEFAULT_PROFILE,
      ...this.data.profile
    };

    if (!profile.personA || !profile.personB || !profile.startDate) {
      wx.showToast({
        title: "请补全昵称和开始日期",
        icon: "none"
      });
      return;
    }

    storage.saveProfile(profile);
    wx.showToast({
      title: "资料已保存",
      icon: "success"
    });
  },

  resetProfile() {
    wx.showModal({
      title: "恢复默认资料",
      content: "仅恢复情侣资料与主题，不会删除留言。",
      success: ({ confirm }) => {
        if (!confirm) {
          return;
        }

        storage.saveProfile(DEFAULT_PROFILE);
        this.loadData();
        wx.showToast({
          title: "已恢复默认资料",
          icon: "success"
        });
      }
    });
  },

  onMemoryInput(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`memoryForm.${field}`]: event.detail.value
    });
  },

  onMemoryDateChange(event) {
    this.setData({
      "memoryForm.date": event.detail.value
    });
  },

  addMemory() {
    const { date, title, content } = this.data.memoryForm;

    if (!title.trim()) {
      wx.showToast({
        title: "先填写纪念标题",
        icon: "none"
      });
      return;
    }

    const memory = {
      id: storage.createId("memory"),
      date,
      title: title.trim(),
      content: content.trim() || "这一天值得记住。"
    };

    const memories = storage.appendMemory(memory);

    this.setData({
      memories,
      memoryForm: {
        date: time.formatDate(new Date()),
        title: "",
        content: ""
      }
    });

    wx.showToast({
      title: "已加入纪念片段",
      icon: "success"
    });
  },

  deleteMemory(event) {
    const { id } = event.currentTarget.dataset;

    wx.showModal({
      title: "删除片段",
      content: "确认删除这条纪念片段吗？",
      success: ({ confirm }) => {
        if (!confirm) {
          return;
        }

        const memories = storage.deleteMemory(id);
        this.setData({ memories });

        wx.showToast({
          title: "已删除",
          icon: "success"
        });
      }
    });
  },

  restoreDefaultMemories() {
    wx.showModal({
      title: "恢复示例纪念片段",
      content: "会覆盖当前纪念片段列表，确认继续吗？",
      success: ({ confirm }) => {
        if (!confirm) {
          return;
        }

        const memories = storage.restoreDefaultMemories();
        this.setData({ memories });
        wx.showToast({
          title: "已恢复示例数据",
          icon: "success"
        });
      }
    });
  },

  clearNotes() {
    wx.showModal({
      title: "清空留言墙",
      content: "该操作无法恢复，确认清空吗？",
      success: ({ confirm }) => {
        if (!confirm) {
          return;
        }

        storage.clearNotes();
        wx.showToast({
          title: "留言已清空",
          icon: "success"
        });
      }
    });
  }
});
