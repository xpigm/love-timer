const { DEFAULT_QUOTES } = require("../../utils/default-data");
const noteService = require("../../utils/note-service");
const profileUtils = require("../../utils/profile-config");
const specialScene = require("../../utils/special-scene");
const storage = require("../../utils/storage");
const time = require("../../utils/time");
const ui = require("../../utils/ui");

const INITIAL_NOTES_LIMIT = 8;
const NOTES_PAGE_SIZE = 8;

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
      ? scene.composerBody || "先把这一刻想留住的话写下来。"
      : scene.composerBody || `${scene.tag ? `${scene.tag} ` : ""}先记一句，留言墙就会从这里开始。`,
    helper: "最多 300 字，适合写一句话、一个心情，或者今天的小瞬间。"
  };
}

function isImageChooseCancel(error) {
  return /cancel/i.test((error && error.errMsg) || (error && error.message) || "");
}

function chooseSingleImage() {
  return new Promise((resolve, reject) => {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sizeType: ["compressed"],
        success: (result) => {
          const file = result.tempFiles && result.tempFiles[0];
          resolve(file ? file.tempFilePath : "");
        },
        fail: reject
      });
      return;
    }

    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (result) => {
        resolve(result.tempFilePaths && result.tempFilePaths[0] ? result.tempFilePaths[0] : "");
      },
      fail: reject
    });
  });
}

function decorateReply(reply, now) {
  const author = reply.author || "匿名";

  return {
    ...reply,
    author,
    authorInitial: author.slice(0, 1),
    avatarUrl: reply.avatarUrl || "",
    imageUrl: reply.imageUrl || "",
    displayTime: time.formatRelativeTime(reply.timestamp, now) || reply.createdAt
  };
}

function getVisibleNotes(notes, visibleCount) {
  return notes.slice(0, visibleCount);
}

function decorateNote(note, index, now) {
  const author = note.author || "匿名";

  return {
    ...note,
    author,
    authorInitial: author.slice(0, 1),
    isLatest: index === 0,
    metaLine: author ? `${author} · ${note.createdAt}` : note.createdAt,
    avatarUrl: note.avatarUrl || "",
    imageUrl: note.imageUrl || "",
    displayTime: time.formatRelativeTime(note.timestamp, now) || note.createdAt,
    replies: (Array.isArray(note.replies) ? note.replies : []).map((reply) => decorateReply(reply, now))
  };
}

function decorateNotes(notes, now = new Date()) {
  return notes.map((note, index) => decorateNote(note, index, now));
}

function buildVisibleNotesState(notes, visibleCount, now = new Date()) {
  const nextVisibleCount = Math.min(visibleCount, notes.length);
  const visibleNotes = getVisibleNotes(notes, nextVisibleCount);

  return {
    notes: decorateNotes(visibleNotes, now),
    visibleNoteCount: visibleNotes.length,
    hiddenNoteCount: Math.max(0, notes.length - visibleNotes.length),
    hasMoreNotes: notes.length > visibleNotes.length,
    noteCount: notes.length
  };
}

function buildWallViewData(profile, scene, notes, options = {}) {
  const content = options.content == null ? "" : options.content;
  const avatarUrl = options.avatarUrl || "";
  const imageUrl = options.imageUrl || "";
  const author = options.author || "";
  const visibleCount = options.visibleCount || Math.min(INITIAL_NOTES_LIMIT, notes.length);

  return {
    themeClass: ui.resolveThemeClass(profile),
    sceneClass: scene.sceneClass || "scene-default",
    profile,
    scene,
    sceneDecorations: scene.decorations || [],
    form: {
      author,
      avatarUrl,
      imageUrl,
      content
    },
    ...buildVisibleNotesState(notes, visibleCount, options.now || new Date()),
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
      imageUrl: "",
      content: ""
    },
    notes: [],
    visibleNoteCount: 0,
    hiddenNoteCount: 0,
    hasMoreNotes: false,
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
    avatarUploading: false,
    imageUploading: false,
    contentError: "",
    composerError: "",
    copySuccessId: "",
    contentFocus: false,
    likeLoadingId: "",
    activeReplyNoteId: "",
    replyForm: {
      content: "",
      imageUrl: ""
    },
    replySubmitting: false,
    replyImageUploading: false,
    replyError: ""
  },

  onLoad() {
    ui.bindThemeChange(this, () => {
      this.loadData();
    });
  },

  onShow() {
    if (this._justFromPreview) {
      this._justFromPreview = false;
    } else {
      this.loadData();
    }
    this.startRelativeTimer();
  },

  onHide() {
    this.stopRelativeTimer();
  },

  onUnload() {
    this.stopRelativeTimer();
    ui.unbindThemeChange(this);
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

  refreshVisibleNotes(visibleCount = this.data.visibleNoteCount || INITIAL_NOTES_LIMIT) {
    const notes = Array.isArray(this.allNotes) ? this.allNotes : [];

    this.setData({
      ...buildVisibleNotesState(notes, visibleCount),
      wallMeta: buildWallMeta(notes, this.data.scene),
      wallHero: buildWallHero(this.data.profile, notes, this.data.scene),
      composerPanel: buildComposerPanel(this.data.scene, notes)
    });
  },

  loadMoreNotes() {
    ui.tapFeedback();
    this.refreshVisibleNotes((this.data.visibleNoteCount || 0) + NOTES_PAGE_SIZE);
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

    ui.syncNavigationBar(profile.theme);
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

    this.allNotes = notes;

    this.setData({
      ...buildWallViewData(profile, scene, notes, {
        author: cachedUserInfo ? cachedUserInfo.nickName : "",
        avatarUrl: cachedUserInfo ? cachedUserInfo.avatarUrl || "" : "",
        imageUrl: this.data.form.imageUrl,
        content: this.data.form.content,
        visibleCount: Math.max(this.data.visibleNoteCount || 0, INITIAL_NOTES_LIMIT)
      }),
      loadingNotes: false,
      loadError
    });
  },

  async onChooseAvatar(event) {
    ui.tapFeedback();
    const { avatarUrl } = event.detail;

    if (!avatarUrl || this.data.avatarUploading) {
      return;
    }

    const previousAvatarUrl = this.data.form.avatarUrl;

    this.setData({
      "form.avatarUrl": avatarUrl,
      avatarUploading: true
    });

    try {
      const uploaded = await noteService.uploadAvatar(avatarUrl);
      this.setData({
        "form.avatarUrl": uploaded.avatarUrl || "",
        avatarUploading: false
      });
      this.updateCachedUserInfo();
    } catch (error) {
      this.setData({
        "form.avatarUrl": previousAvatarUrl,
        avatarUploading: false
      });
      wx.showToast({
        title: error && error.message ? error.message : "头像上传失败",
        icon: "none"
      });
    }
  },

  async chooseNoteImage() {
    ui.tapFeedback();

    if (this.data.imageUploading) {
      return;
    }

    const previousImageUrl = this.data.form.imageUrl;

    try {
      const filePath = await chooseSingleImage();
      if (!filePath) {
        return;
      }

      this.setData({
        "form.imageUrl": filePath,
        imageUploading: true,
        composerError: ""
      });
      const uploaded = await noteService.uploadNoteImage(filePath);
      this.setData({
        "form.imageUrl": uploaded.imageUrl || "",
        imageUploading: false
      });
    } catch (error) {
      if (isImageChooseCancel(error)) {
        return;
      }

      this.setData({
        "form.imageUrl": previousImageUrl,
        imageUploading: false,
        composerError: error && error.message ? error.message : "图片上传失败"
      });
    }
  },

  removeNoteImage() {
    if (this.data.imageUploading) {
      return;
    }

    ui.tapFeedback();
    this.setData({
      "form.imageUrl": "",
      composerError: ""
    });
  },

  async chooseReplyImage() {
    ui.tapFeedback();

    if (this.data.replyImageUploading) {
      return;
    }

    const previousImageUrl = this.data.replyForm.imageUrl;

    try {
      const filePath = await chooseSingleImage();
      if (!filePath) {
        return;
      }

      this.setData({
        "replyForm.imageUrl": filePath,
        replyImageUploading: true,
        replyError: ""
      });
      const uploaded = await noteService.uploadNoteImage(filePath);
      this.setData({
        "replyForm.imageUrl": uploaded.imageUrl || "",
        replyImageUploading: false
      });
    } catch (error) {
      if (isImageChooseCancel(error)) {
        return;
      }

      this.setData({
        "replyForm.imageUrl": previousImageUrl,
        replyImageUploading: false,
        replyError: error && error.message ? error.message : "图片上传失败"
      });
    }
  },

  removeReplyImage() {
    if (this.data.replyImageUploading) {
      return;
    }

    ui.tapFeedback();
    this.setData({
      "replyForm.imageUrl": "",
      replyError: ""
    });
  },

  previewImage(event) {
    const { src } = event.currentTarget.dataset;
    if (!src) {
      return;
    }

    ui.tapFeedback();
    this._justFromPreview = true;
    wx.previewImage({
      urls: [src],
      current: src
    });
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
    const { author, avatarUrl } = this.data.form;
    if (author || avatarUrl) {
      storage.saveUserInfo({
        nickName: author,
        avatarUrl
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
    ui.tapFeedback();
    this.setData({
      contentFocus: true
    });
  },

  fillInspiration() {
    ui.tapFeedback();
    const text = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)].trim();
    const content = this.data.form.content ? `${this.data.form.content}\n${text}` : text;

    this.setData({
      "form.content": content,
      contentError: "",
      composerError: ""
    });
  },

  findNoteIndex(noteId) {
    return this.data.notes.findIndex((note) => note.id === noteId);
  },

  updateStoredNote(noteId, updater) {
    const notes = Array.isArray(this.allNotes) ? this.allNotes : [];
    const index = notes.findIndex((note) => note.id === noteId);
    if (index === -1) {
      return null;
    }

    const nextNote = updater(notes[index]);
    this.allNotes = [
      ...notes.slice(0, index),
      nextNote,
      ...notes.slice(index + 1)
    ];

    return nextNote;
  },

  updateVisibleNote(noteId, updater) {
    const visibleIndex = this.findNoteIndex(noteId);
    const nextNote = this.updateStoredNote(noteId, updater);

    if (!nextNote || visibleIndex === -1) {
      return;
    }

    this.setData({
      [`notes[${visibleIndex}]`]: decorateNote(nextNote, visibleIndex, new Date())
    });
  },

  async toggleLike(event) {
    const { id } = event.currentTarget.dataset;
    const note = (Array.isArray(this.allNotes) ? this.allNotes : this.data.notes).find((item) => item.id === id);

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
    this.updateVisibleNote(id, (item) => ({
      ...item,
      likedByMe: optimisticLiked,
      likesCount: Math.max(0, Number(item.likesCount || 0) + (optimisticLiked ? 1 : -1))
    }));

    try {
      const result = await noteService.toggleLike(id);
      this.updateVisibleNote(id, (item) => ({
        ...item,
        likedByMe: Boolean(result.likedByMe),
        likesCount: Number(result.likesCount || 0)
      }));
      ui.tapFeedback();
    } catch (error) {
      this.updateVisibleNote(id, (item) => ({
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
        content: "",
        imageUrl: ""
      },
      replyImageUploading: false,
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
    const imageUrl = this.data.replyForm.imageUrl || "";

    if (this.data.replySubmitting) {
      return;
    }

    if (this.data.avatarUploading || this.data.replyImageUploading) {
      this.setData({
        replyError: this.data.replyImageUploading ? "图片还在上传，稍等一下。" : "头像还在上传，稍等一下。"
      });
      return;
    }

    if (!content && !imageUrl) {
      this.setData({
        replyError: "先写一句回复，或添加一张图片。"
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
        avatarUrl: this.data.form.avatarUrl || "",
        imageUrl,
        content
      });

      this.updateCachedUserInfo();
      this.updateVisibleNote(id, (note) => ({
        ...note,
        replies: [...(Array.isArray(note.replies) ? note.replies : []), reply]
      }));
      this.setData({
        activeReplyNoteId: "",
        replyForm: {
          content: "",
          imageUrl: ""
        },
        replySubmitting: false
      });
      ui.tapFeedback();
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
    const avatarUrl = this.data.form.avatarUrl || "";
    const imageUrl = this.data.form.imageUrl || "";
    const content = (this.data.form.content || "").trim();

    if (this.data.avatarUploading || this.data.imageUploading) {
      this.setData({
        composerError: this.data.imageUploading ? "图片还在上传，稍等一下。" : "头像还在上传，稍等一下。"
      });
      return;
    }

    if (!content && !imageUrl) {
      this.setData({
        contentError: "先写一句想留下的话，或添加一张图片。"
      });
      return;
    }

    this.setData({
      submitting: true,
      contentError: "",
      composerError: ""
    });

    try {
      const createdNote = await noteService.createNote({
        author,
        avatarUrl,
        imageUrl,
        content
      });
      this.updateCachedUserInfo();
      const notes = [createdNote, ...(Array.isArray(this.allNotes) ? this.allNotes : [])];
      this.allNotes = notes;

      this.setData({
        ...buildWallViewData(this.data.profile, this.data.scene, notes, {
          author: this.data.form.author,
          avatarUrl: this.data.form.avatarUrl,
          imageUrl: "",
          content: "",
          visibleCount: Math.max(this.data.visibleNoteCount || 0, INITIAL_NOTES_LIMIT)
        }),
        submitting: false,
        contentError: "",
        composerError: "",
        loadError: ""
      });

      ui.tapFeedback();

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
