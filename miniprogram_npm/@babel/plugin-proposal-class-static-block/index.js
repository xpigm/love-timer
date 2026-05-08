module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841515, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _pluginSyntaxClassStaticBlock = require("@babel/plugin-syntax-class-static-block");
var _helperCreateClassFeaturesPlugin = require("@babel/helper-create-class-features-plugin");
function generateUid(scope, denyList) {
  const name = "";
  let uid;
  let i = 1;
  do {
    uid = scope._generateUid(name, i);
    i++;
  } while (denyList.has(uid));
  return uid;
}
var _default = (0, _helperPluginUtils.declare)(({
  types: t,
  template,
  assertVersion
}) => {
  assertVersion("^7.12.0");
  return {
    name: "proposal-class-static-block",
    inherits: _pluginSyntaxClassStaticBlock.default,
    pre() {
      (0, _helperCreateClassFeaturesPlugin.enableFeature)(this.file, _helperCreateClassFeaturesPlugin.FEATURES.staticBlocks, false);
    },
    visitor: {
      ClassBody(classBody) {
        const {
          scope
        } = classBody;
        const privateNames = new Set();
        const body = classBody.get("body");
        for (const path of body) {
          if (path.isPrivate()) {
            privateNames.add(path.get("key.id").node.name);
          }
        }
        for (const path of body) {
          if (!path.isStaticBlock()) continue;
          const staticBlockPrivateId = generateUid(scope, privateNames);
          privateNames.add(staticBlockPrivateId);
          const staticBlockRef = t.privateName(t.identifier(staticBlockPrivateId));
          let replacement;
          const blockBody = path.node.body;
          if (blockBody.length === 1 && t.isExpressionStatement(blockBody[0])) {
            replacement = t.inheritsComments(blockBody[0].expression, blockBody[0]);
          } else {
            replacement = template.expression.ast`(() => { ${blockBody} })()`;
          }
          path.replaceWith(t.classPrivateProperty(staticBlockRef, replacement, [], true));
        }
      }
    }
  };
});
exports.default = _default;

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841515);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/plugin-syntax-class-static-block","@babel/helper-create-class-features-plugin"]
//# sourceMappingURL=index.js.map