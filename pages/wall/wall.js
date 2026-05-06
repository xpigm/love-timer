const { DEFAULT_QUOTES } = require("../../utils/default-data");
const noteService = require("../../utils/note-service");
const profileUtils = require("../../utils/profile-config");
const specialScene = require("../../utils/special-scene");
const storage = require("../../utils/storage");
const time = require("../../utils/time");

function buildTodayLabel() {
  return time.formatDate(new Date()).replace(/-/g, ".");
}

function hasSpecialScene(scene) {
  return Boolean(scene && scene.key && scene.key !== "default");
}

function buildWallMeta(notes, scene) {
  return {
    badge: hasSpecialScene(scene) ? scene.badge || scene.title || "" : "",
    date: buildTodayLabel(),
    kicker: scene.wallKicker || "MEMORY WALL",
    status: notes.length ? `${notes.length} 条留言` : "还没有留言",
    streamHint: notes.length ? "新的在上面" : "等第一条出现",
    empty: hasSpecialScene(scene)
      ? "这一页还空着，先写下今天想认真留住的一句。"
      : "还没有留下内容，写下第一条留言吧。"
  };
}

function buildWallHero(profile, notes, scene) {
  const special = hasSpecialScene(scene);

  return {
    title: scene.wallTitle || (notes.length ? "把想说的话慢慢留下来" : "从第一句话开始记录"),
    body: notes.length
      ? scene.wallBody || `这里收着 ${profile.personA} 和 ${profile.personB} 留下来的片段。${scene.tag || scene.description || "有些话写下来，会比当下更久。"}`
      : scene.wallBody || `${scene.tag ? `${scene.tag} ` : ""}现在写下的第一句话，以后会变成最早的一张纪念卡。`,
    coverline: notes.length
      ? `最近更新于 ${notes[0].createdAt}`
      : special
        ? scene.heroSubline || `${profile.personA} · ${profile.personB}`
        : `${profile.personA} · ${profile.personB}`
  };
}

function buildComposerPanel(scene, notes) {
  return {
    title: scene.composerTitle || (notes.length ? "写一张小纸条" : "写下第一张小纸条"),
    body: notes.length
      ? scene.composerBody || "头像和署名可以以后再改，先把这一刻想留住的话写下来。"
      : scene.composerBody || `${scene.tag ? `${scene.tag} ` : ""}先记一句，留言墙就会从这里开始。`,
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

function decorateReply(reply, now) {
  const author = reply.author || "匿名";

  return {
    ...reply,
    author,
    authorInitial: author.slice(0, 1),
    avatarUrl: reply.avatarBase64 || reply.avatarUrl || "",
    displayTime: time.formatRelativeTime(reply.timestamp, now) || reply.createdAt
  };
}

function decorateNotes(notes, now = new Date()) {
  return notes.map((note, index) => {
    const author = note.author || "匿名";

    return {
      ...note,
      author,
      authorInitial: author.slice(0, 1),
      isLatest: index === 0,
      metaLine: author ? `${author} · ${note.createdAt}` : note.createdAt,
      avatarUrl: note.avatarBase64 || note.avatarUrl || "",
      displayTime: time.formatRelativeTime(note.timestamp, now) || note.createdAt,
      replies: (Array.isArray(note.replies) ? note.replies : []).map((reply) => decorateReply(reply, now))
    };
  });
}

function inferMimeType(filePath) {
  const normalized = String(filePath || "").toLowerCase();

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalized.endsWith(".gif")) {
    return "image/gif";
  }

  return "image/jpeg";
}

function readAvatarAsDataUrl(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: "base64",
      success: ({ data }) => {
        resolve(`data:${inferMimeType(filePath)};base64,${data}`);
      },
      fail: (error) => {
        reject(new Error((error && error.errMsg) || "头像读取失败"));
      }
    });
  });
}

function buildWallViewData(profile, scene, notes, options = {}) {
  const content = options.content == null ? "" : options.content;
  const avatarUrl = options.avatarUrl || "";
  const avatarBase64 = options.avatarBase64 || "";
  const author = options.author || "";

  return {
    themeClass: `theme-${profile.theme || "blush"}`,
    sceneClass: scene.sceneClass || "scene-default",
    profile,
    scene,
    sceneDecorations: scene.decorations || [],
    form: {
      author,
      avatarUrl,
      avatarBase64,
      content
    },
    notes: decorateNotes(notes, options.now || new Date()),
    noteCount: notes.length,
    wallMeta: buildWallMeta(notes, scene),
    wallHero: buildWallHero(profile, notes, scene),
    composerPanel: buildComposerPanel(scene, notes)
  };
}

Page({
  data: {
    themeClass: "theme-blush",
    sceneClass: "scene-default",
    profile: {},
    sceneDecorations: [],
    scene: {
      title: "",
      tag: "",
      badge: "",
      description: "",
      metricValue: "",
      metricDesc: ""
    },
    form: {
      author: "",
      avatarUrl: "",
      avatarBase64: "",
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
    },
    loadingNotes: false,
    loadError: "",
    submitting: false,
    contentError: "",
    composerError: "",
    copySuccessId: "",
    contentFocus: false,
    likeLoadingId: "",
    activeReplyNoteId: "",
    replyForm: {
      content: ""
    },
    replySubmitting: false,
    replyError: ""
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
    this.startRelativeTimer();
  },

  onHide() {
    this.stopRelativeTimer();
  },

  onUnload() {
    this.stopRelativeTimer();
  },

  startRelativeTimer() {
    this.stopRelativeTimer();
    this.relativeTimer = setInterval(() => {
      this.refreshRelativeTimes();
    }, 60000);
  },

  stopRelativeTimer() {
    if (this.relativeTimer) {
      clearInterval(this.relativeTimer);
      this.relativeTimer = null;
    }
  },

  refreshRelativeTimes() {
    this.setData({
      notes: decorateNotes(this.data.notes)
    });
  },

  async loadData() {
    const profile = profileUtils.getProfile();
    const scene = specialScene.getSpecialScene(profile);
    const cachedUserInfo = storage.getUserInfo();
    let notes = [];
    let loadError = "";

    syncNavigationBar(profile.theme);
    this.setData({
      loadingNotes: true,
      loadError: ""
    });

    try {
      notes = await noteService.fetchNotes();
    } catch (error) {
      notes = [];
      loadError = error && error.message ? error.message : "留言加载失败";
    }

    this.setData({
      ...buildWallViewData(profile, scene, notes, {
        author: cachedUserInfo ? cachedUserInfo.nickName : "",
        avatarUrl: cachedUserInfo ? (cachedUserInfo.avatarBase64 || cachedUserInfo.avatarUrl || "") : "",
        avatarBase64: cachedUserInfo ? cachedUserInfo.avatarBase64 || "" : "",
        content: this.data.form.content
      }),
      loadingNotes: false,
      loadError
    });
  },

  async onChooseAvatar(event) {
    tapFeedback();
    const { avatarUrl } = event.detail;

    try {
      const avatarBase64 = await readAvatarAsDataUrl(avatarUrl);
      this.setData({
        "form.avatarUrl": avatarBase64,
        "form.avatarBase64": avatarBase64
      });
      this.updateCachedUserInfo();
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : "头像处理失败",
        icon: "none"
      });
    }
  },

  onNicknameInput(event) {
    const { value } = event.detail;
    this.setData({
      "form.author": value
    });
  },

  onNicknameBlur(event) {
    const { value } = event.detail;
    this.setData({
      "form.author": value
    });
    this.updateCachedUserInfo();
  },

  updateCachedUserInfo() {
    const { author, avatarUrl, avatarBase64 } = this.data.form;
    if (author || avatarUrl || avatarBase64) {
      storage.saveUserInfo({
        nickName: author,
        avatarUrl: avatarBase64 || avatarUrl,
        avatarBase64
      });
    }
  },

  onContentInput(event) {
    const content = event.detail.value;

    this.setData({
      "form.content": content,
      contentError: content.trim() ? "" : this.data.contentError
    });
  },

  onContentFocus() {
    if (this.data.contentFocus) {
      this.setData({
        contentFocus: false
      });
    }
  },

  focusComposer() {
    tapFeedback();
    this.setData({
      contentFocus: true
    });
  },

  fillInspiration() {
    tapFeedback();
    const text = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)].trim();
    const content = this.data.form.content ? `${this.data.form.content}\n${text}` : text;

    this.setData({
      "form.content": content,
      contentError: "",
      composerError: ""
    });
  },

  updateNote(noteId, updater) {
    const notes = this.data.notes.map((note) => (
      note.id === noteId ? updater(note) : note
    ));

    this.setData({
      notes: decorateNotes(notes)
    });
  },

  async toggleLike(event) {
    const { id } = event.currentTarget.dataset;
    const note = this.data.notes.find((item) => item.id === id);

    if (!note || this.data.likeLoadingId === id) {
      return;
    }

    const previous = {
      likedByMe: note.likedByMe,
      likesCount: note.likesCount
    };
    const optimisticLiked = !note.likedByMe;

    this.setData({
      likeLoadingId: id
    });
    this.updateNote(id, (item) => ({
      ...item,
      likedByMe: optimisticLiked,
      likesCount: Math.max(0, Number(item.likesCount || 0) + (optimisticLiked ? 1 : -1))
    }));

    try {
      const result = await noteService.toggleLike(id);
      this.updateNote(id, (item) => ({
        ...item,
        likedByMe: Boolean(result.likedByMe),
        likesCount: Number(result.likesCount || 0)
      }));
      tapFeedback();
    } catch (error) {
      this.updateNote(id, (item) => ({
        ...item,
        likedByMe: previous.likedByMe,
        likesCount: previous.likesCount
      }));
      wx.showToast({
        title: error && error.message ? error.message : "喜欢失败",
        icon: "none"
      });
    } finally {
      this.setData({
        likeLoadingId: ""
      });
    }
  },

  openReply(event) {
    const { id } = event.currentTarget.dataset;

    this.setData({
      activeReplyNoteId: this.data.activeReplyNoteId === id ? "" : id,
      replyForm: {
        content: ""
      },
      replyError: ""
    });
  },

  onReplyInput(event) {
    this.setData({
      "replyForm.content": event.detail.value,
      replyError: ""
    });
  },

  async submitReply(event) {
    const { id } = event.currentTarget.dataset;
    const content = (this.data.replyForm.content || "").trim();

    if (this.data.replySubmitting) {
      return;
    }

    if (!content) {
      this.setData({
        replyError: "先写一句回复。"
      });
      return;
    }

    this.setData({
      replySubmitting: true,
      replyError: ""
    });

    try {
      const reply = await noteService.createReply(id, {
        author: this.data.form.author || "匿名",
        avatarBase64: this.data.form.avatarBase64 || "",
        content
      });

      this.updateCachedUserInfo();
      this.updateNote(id, (note) => ({
        ...note,
        replies: [...(Array.isArray(note.replies) ? note.replies : []), reply]
      }));
      this.setData({
        activeReplyNoteId: "",
        replyForm: {
          content: ""
        },
        replySubmitting: false
      });
      tapFeedback();
    } catch (error) {
      this.setData({
        replySubmitting: false,
        replyError: error && error.message ? error.message : "回复失败，请稍后重试。"
      });
    }
  },

  async submitNote() {
    if (this.data.submitting) {
      return;
    }

    const author = this.data.form.author || "匿名";
    const avatarBase64 = this.data.form.avatarBase64 || "";
    const content = (this.data.form.content || "").trim();

    if (!content) {
      this.setData({
        contentError: "先写一句想留下的话。"
      });
      return;
    }

    this.setData({
      submitting: true,
      contentError: "",
      composerError: ""
    });

    try {
      await noteService.createNote({
        author,
        avatarBase64,
        content
      });
      this.updateCachedUserInfo();
      const notes = await noteService.fetchNotes();

      this.setData({
        ...buildWallViewData(this.data.profile, this.data.scene, notes, {
          author: this.data.form.author,
          avatarUrl: this.data.form.avatarUrl,
          avatarBase64: this.data.form.avatarBase64,
          content: ""
        }),
        submitting: false,
        contentError: "",
        composerError: "",
        loadError: ""
      });

      tapFeedback();

      wx.showToast({
        title: "留言已保存",
        icon: "success"
      });
    } catch (error) {
      this.setData({
        submitting: false,
        composerError: error && error.message ? error.message : "留言保存失败，请稍后重试。"
      });
    }
  },

  copyNote(event) {
    const { content, id } = event.currentTarget.dataset;
    wx.setClipboardData({
      data: content,
      success: () => {
        this.setData({
          copySuccessId: id
        });

        if (this.copySuccessTimer) {
          clearTimeout(this.copySuccessTimer);
        }

        this.copySuccessTimer = setTimeout(() => {
          if (this.data.copySuccessId === id) {
            this.setData({
              copySuccessId: ""
            });
          }
        }, 1600);
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
