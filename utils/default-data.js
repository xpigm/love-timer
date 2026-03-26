const STORAGE_KEYS = {
  profile: "love-profile",
  notes: "love-notes",
  memories: "love-memories"
};

const DEFAULT_PROFILE = {
  personA: "小宇",
  personB: "小满",
  startDate: "2020-07-04",
  title: "我们已经相恋",
  city: "上海",
  promise: "把普通日子过成纪念日。",
  theme: "blush"
};

const DEFAULT_QUOTES = [
  "你在的时候，风都变得温柔一些。",
  "和你有关的日子，普通也会发光。",
  "想把今天的晚霞，和明天的早餐都分给你。",
  "谢谢你，把我的生活过成了值得收藏的样子。",
  "如果心动有声音，大概一直都是你的名字。",
  "你负责出现，我负责越来越喜欢你。",
  "今天喜欢你，明天也会，后天也不会例外。",
  "想和你一起，把小事慢慢过成浪漫。",
  "见到你之后，日子开始有了准确的甜度。",
  "你是我想认真记录、长期偏爱的人。",
  "和你在一起之后，我开始期待每一个明天。",
  "我们不是把时间熬过去，而是把时间过成礼物。"
];

const DEFAULT_NOTES = [
  {
    id: "note-demo",
    author: "小宇",
    content: "欢迎来到我们的恋爱纪念册，今天也要记得好好吃饭。",
    createdAt: "2026-03-26 10:00",
    timestamp: 1774490400000
  }
];

const DEFAULT_MEMORIES = [
  {
    id: "memory-1",
    date: "2020-07-04",
    title: "恋爱第一天",
    content: "从这一天起，普通的一天有了新的名字。"
  },
  {
    id: "memory-2",
    date: "2020-08-15",
    title: "第一次一起旅行",
    content: "在陌生城市散步，也像回到了自己熟悉的生活里。"
  },
  {
    id: "memory-3",
    date: "2021-02-14",
    title: "第一个情人节",
    content: "没做盛大的事，只认真陪在彼此身边。"
  },
  {
    id: "memory-4",
    date: "2022-12-31",
    title: "跨年夜",
    content: "一起倒数的时候，希望以后每年都能这样。"
  }
];

const THEME_OPTIONS = [
  {
    label: "奶油粉",
    value: "blush"
  },
  {
    label: "海盐蓝",
    value: "ocean"
  },
  {
    label: "落日晚霞",
    value: "sunset"
  }
];

module.exports = {
  STORAGE_KEYS,
  DEFAULT_PROFILE,
  DEFAULT_QUOTES,
  DEFAULT_NOTES,
  DEFAULT_MEMORIES,
  THEME_OPTIONS
};
