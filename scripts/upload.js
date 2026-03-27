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
const packageJson = require("../package.json");
const projectConfig = require("../project.config.json");
const miniprogramConfig = packageJson.miniprogram || {};

const projectPath = path.resolve(__dirname, "..");
const appid = projectConfig.appid;
const privateKeyPath = path.join(projectPath, `private.${appid}.key`);
const version = process.env.MINIPROGRAM_VERSION || packageJson.version;
const desc =
  process.env.MINIPROGRAM_DESC ||
  miniprogramConfig.uploadDescription ||
  packageJson.description;
const robot = miniprogramConfig.robot || 1;

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
    useCOS: true,
    setting: {
      es6: true,
      minify: true,
      codeProtect: false,
      autoPrefixWXSS: true
    },
    robot,
    threads: 8,
    onProgressUpdate(progress) {
      console.log(`[upload] ${progress.status}: ${progress.message || progress.id}`);
    }
  });

  console.log("Upload success");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Upload failed");
  console.error(error);
  process.exit(1);
});
