const PROFILE_CONFIG = require("../config/profile");

const DEFAULT_PROFILE = {
  personA: "小宇",
  personB: "小满",
  startTime: "2020-07-04 22:54:00",
  title: "我们已经相恋",
  city: "北京",
  promise: "把普通日子过成纪念日。",
  theme: "blush",
  specialDates: []
};

function getProfile() {
  const profile = {
    ...DEFAULT_PROFILE,
    ...PROFILE_CONFIG
  };

  const startTime = profile.startTime || DEFAULT_PROFILE.startTime;

  return {
    ...profile,
    startTime,
    startDate: startTime.slice(0, 10),
    specialDates: Array.isArray(profile.specialDates) ? profile.specialDates : []
  };
}

module.exports = {
  getProfile
};
