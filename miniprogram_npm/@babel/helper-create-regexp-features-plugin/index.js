module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841104, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRegExpFeaturePlugin = createRegExpFeaturePlugin;
var _regexpuCore = require("regexpu-core");
var _core = require("@babel/core");
var _helperAnnotateAsPure = require("@babel/helper-annotate-as-pure");
var _semver = require("semver");
var _features = require("./features");
var _util = require("./util");
const versionKey = "@babel/plugin-regexp-features/version";
function createRegExpFeaturePlugin({
  name,
  feature,
  options = {},
  manipulateOptions = () => {}
}) {
  return {
    name,
    manipulateOptions,
    pre() {
      var _file$get;
      const {
        file
      } = this;
      const features = (_file$get = file.get(_features.featuresKey)) != null ? _file$get : 0;
      let newFeatures = (0, _features.enableFeature)(features, _features.FEATURES[feature]);
      const {
        useUnicodeFlag,
        runtime
      } = options;
      if (useUnicodeFlag === false) {
        newFeatures = (0, _features.enableFeature)(newFeatures, _features.FEATURES.unicodeFlag);
      }
      if (newFeatures !== features) {
        file.set(_features.featuresKey, newFeatures);
      }
      if (runtime !== undefined) {
        if (file.has(_features.runtimeKey) && file.get(_features.runtimeKey) !== runtime && (0, _features.hasFeature)(newFeatures, _features.FEATURES.duplicateNamedCaptureGroups)) {
          throw new Error(`The 'runtime' option must be the same for ` + `'@babel/plugin-transform-named-capturing-groups-regex' and ` + `'@babel/plugin-proposal-duplicate-named-capturing-groups-regex'.`);
        }
        if (feature === "namedCaptureGroups") {
          if (!runtime || !file.has(_features.runtimeKey)) file.set(_features.runtimeKey, runtime);
        } else {
          file.set(_features.runtimeKey, runtime);
        }
      }
      {
        if (typeof file.get(versionKey) === "number") {
          file.set(versionKey, "7.22.9");
          return;
        }
      }
      if (!file.get(versionKey) || _semver.lt(file.get(versionKey), "7.22.9")) {
        file.set(versionKey, "7.22.9");
      }
    },
    visitor: {
      RegExpLiteral(path) {
        var _file$get2, _newFlags;
        const {
          node
        } = path;
        const {
          file
        } = this;
        const features = file.get(_features.featuresKey);
        const runtime = (_file$get2 = file.get(_features.runtimeKey)) != null ? _file$get2 : true;
        const regexpuOptions = (0, _util.generateRegexpuOptions)(node.pattern, features);
        if ((0, _util.canSkipRegexpu)(node, regexpuOptions)) {
          return;
        }
        const namedCaptureGroups = {
          __proto__: null
        };
        if (regexpuOptions.namedGroups === "transform") {
          regexpuOptions.onNamedGroup = (name, index) => {
            const prev = namedCaptureGroups[name];
            if (typeof prev === "number") {
              namedCaptureGroups[name] = [prev, index];
            } else if (Array.isArray(prev)) {
              prev.push(index);
            } else {
              namedCaptureGroups[name] = index;
            }
          };
        }
        let newFlags;
        if (regexpuOptions.modifiers === "transform") {
          regexpuOptions.onNewFlags = flags => {
            newFlags = flags;
          };
        }
        node.pattern = _regexpuCore(node.pattern, node.flags, regexpuOptions);
        if (regexpuOptions.namedGroups === "transform" && Object.keys(namedCaptureGroups).length > 0 && runtime && !isRegExpTest(path)) {
          const call = _core.types.callExpression(this.addHelper("wrapRegExp"), [node, _core.types.valueToNode(namedCaptureGroups)]);
          (0, _helperAnnotateAsPure.default)(call);
          path.replaceWith(call);
        }
        node.flags = (0, _util.transformFlags)(regexpuOptions, (_newFlags = newFlags) != null ? _newFlags : node.flags);
      }
    }
  };
}
function isRegExpTest(path) {
  return path.parentPath.isMemberExpression({
    object: path.node,
    computed: false
  }) && path.parentPath.get("property").isIdentifier({
    name: "test"
  });
}

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./features":1778207841105,"./util":1778207841106}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841105, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FEATURES = void 0;
exports.enableFeature = enableFeature;
exports.featuresKey = void 0;
exports.hasFeature = hasFeature;
exports.runtimeKey = void 0;
const FEATURES = Object.freeze({
  unicodeFlag: 1 << 0,
  dotAllFlag: 1 << 1,
  unicodePropertyEscape: 1 << 2,
  namedCaptureGroups: 1 << 3,
  unicodeSetsFlag_syntax: 1 << 4,
  unicodeSetsFlag: 1 << 5,
  duplicateNamedCaptureGroups: 1 << 6,
  modifiers: 1 << 7
});
exports.FEATURES = FEATURES;
const featuresKey = "@babel/plugin-regexp-features/featuresKey";
exports.featuresKey = featuresKey;
const runtimeKey = "@babel/plugin-regexp-features/runtimeKey";
exports.runtimeKey = runtimeKey;
function enableFeature(features, feature) {
  return features | feature;
}
function hasFeature(features, feature) {
  return !!(features & feature);
}

//# sourceMappingURL=features.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841106, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canSkipRegexpu = canSkipRegexpu;
exports.generateRegexpuOptions = generateRegexpuOptions;
exports.transformFlags = transformFlags;
var _features = require("./features");
function generateRegexpuOptions(pattern, toTransform) {
  const feat = (name, ok = "transform") => {
    return (0, _features.hasFeature)(toTransform, _features.FEATURES[name]) ? ok : false;
  };
  const featDuplicateNamedGroups = () => {
    if (!feat("duplicateNamedCaptureGroups")) return false;
    const regex = /\(\?<([^>]+)>/g;
    const seen = new Set();
    for (let match; match = regex.exec(pattern); seen.add(match[1])) {
      if (seen.has(match[1])) return "transform";
    }
    return false;
  };
  return {
    unicodeFlag: feat("unicodeFlag"),
    unicodeSetsFlag: feat("unicodeSetsFlag") || "parse",
    dotAllFlag: feat("dotAllFlag"),
    unicodePropertyEscapes: feat("unicodePropertyEscape"),
    namedGroups: feat("namedCaptureGroups") || featDuplicateNamedGroups(),
    onNamedGroup: () => {},
    modifiers: feat("modifiers")
  };
}
function canSkipRegexpu(node, options) {
  const {
    flags,
    pattern
  } = node;
  if (flags.includes("v")) {
    if (options.unicodeSetsFlag === "transform") return false;
  }
  if (flags.includes("u")) {
    if (options.unicodeFlag === "transform") return false;
    if (options.unicodePropertyEscapes === "transform" && /\\[pP]{/.test(pattern)) {
      return false;
    }
  }
  if (flags.includes("s")) {
    if (options.dotAllFlag === "transform") return false;
  }
  if (options.namedGroups === "transform" && /\(\?<(?![=!])/.test(pattern)) {
    return false;
  }
  if (options.modifiers === "transform" && /\(\?[\w-]+:/.test(pattern)) {
    return false;
  }
  return true;
}
function transformFlags(regexpuOptions, flags) {
  if (regexpuOptions.unicodeSetsFlag === "transform") {
    flags = flags.replace("v", "u");
  }
  if (regexpuOptions.unicodeFlag === "transform") {
    flags = flags.replace("u", "");
  }
  if (regexpuOptions.dotAllFlag === "transform") {
    flags = flags.replace("s", "");
  }
  return flags;
}

//# sourceMappingURL=util.js.map

}, function(modId) { var map = {"./features":1778207841105}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841104);
})()
//miniprogram-npm-outsideDeps=["regexpu-core","@babel/core","@babel/helper-annotate-as-pure","semver"]
//# sourceMappingURL=index.js.map