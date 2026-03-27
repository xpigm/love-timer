const PROFILE_CONFIG = require("../config/profile");

const DEFAULT_START_TIME = "2020-07-04 22:54:00";

function getProfile() {
  const startTime = PROFILE_CONFIG.startTime || DEFAULT_START_TIME;

  return {
    ...PROFILE_CONFIG,
    startTime,
    specialDates: Array.isArray(PROFILE_CONFIG.specialDates)
      ? PROFILE_CONFIG.specialDates
      : []
  };
}

module.exports = {
  getProfile
};
