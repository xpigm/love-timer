const specialScene = require("../utils/special-scene");

const baseProfile = {
  personA: "孟",
  personB: "张",
  startTime: "2020-07-04 22:54:00",
  title: "我们已经相恋",
  city: "北京",
  theme: "blush",
  specialDates: []
};

const sceneChecks = [
  { label: "default", date: "2026-05-11", expectedClass: "scene-default" },
  { label: "520", date: "2026-05-20", expectedClass: "scene-520", specialDate: { key: "520", month: 5, day: 20 } },
  { label: "anniversary", date: "2026-07-04", expectedClass: "scene-anniversary", specialDate: { key: "anniversary", month: 7, day: 4 } },
  { label: "birthday", date: "2026-06-29", expectedClass: "scene-birthday", specialDate: { key: "birthday", month: 6, day: 29 } },
  { label: "winter", date: "2026-12-25", expectedClass: "scene-christmas", specialDate: { key: "christmas", month: 12, day: 25 } },
  { label: "newyear", date: "2026-12-31", expectedClass: "scene-newyear", specialDate: { key: "newyear", month: 12, day: 31 } },
  { label: "milestone", date: "2026-01-31", expectedClass: "scene-milestone", startTime: "2026-01-01 00:00:00" }
];

function buildProfile(check) {
  return {
    ...baseProfile,
    startTime: check.startTime || baseProfile.startTime,
    specialDates: check.specialDate ? [check.specialDate] : []
  };
}

function assertScene(check) {
  const scene = specialScene.getSpecialScene(buildProfile(check), new Date(`${check.date} 12:00:00`));

  if (scene.sceneClass !== check.expectedClass) {
    throw new Error(`${check.label}: expected ${check.expectedClass}, got ${scene.sceneClass}`);
  }

  if (!Array.isArray(scene.decorations) || !scene.decorations.length) {
    throw new Error(`${check.label}: missing scene decorations`);
  }

  if (!scene.wallTitle || !scene.composerTitle || !scene.heroEyebrow) {
    throw new Error(`${check.label}: missing core copy fields`);
  }

  return `${check.label}: ${scene.sceneClass}`;
}

const results = sceneChecks.map(assertScene);
console.log(results.join("\n"));
