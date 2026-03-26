const path = require("path");

if (!global.localStorage || typeof global.localStorage.getItem !== "function") {
  const memoryStorage = {};
  global.localStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(memoryStorage, key)
        ? memoryStorage[key]
        : null;
    },
    async getItemAsync(key) {
      return this.getItem(key);
    },
    setItem(key, value) {
      memoryStorage[key] = String(value);
    },
    async setItemAsync(key, value) {
      this.setItem(key, value);
    },
    removeItem(key) {
      delete memoryStorage[key];
    }
  };
}

const ci = require("miniprogram-ci");

const projectPath = path.resolve(__dirname, "..");
const appid = "wx5b772cc8dc9677c2";
const privateKeyPath = path.join(projectPath, "private.wx5b772cc8dc9677c2.key");
const version = process.env.MINIPROGRAM_VERSION || "1.0.0";
const desc =
  process.env.MINIPROGRAM_DESC ||
  "初始版本，包含核心功能：恋爱天数计时、纪念日提醒、留言记录、纪念片段整理及个性化资料设置。";

async function main() {
  const project = new ci.Project({
    appid,
    type: "miniProgram",
    projectPath,
    privateKeyPath,
    ignores: ["node_modules/**/*"]
  });

  const result = await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: true,
      minify: true,
      codeProtect: false,
      autoPrefixWXSS: true
    },
    robot: 1,
    threads: 8
  });

  console.log("Upload success");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Upload failed");
  console.error(error);
  process.exit(1);
});
