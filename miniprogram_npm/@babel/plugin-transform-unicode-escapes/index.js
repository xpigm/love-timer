module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841866, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _core = require("@babel/core");
var _default = (0, _helperPluginUtils.declare)(api => {
  api.assertVersion(7);
  const surrogate = /[\ud800-\udfff]/g;
  const unicodeEscape = /(\\+)u\{([0-9a-fA-F]+)\}/g;
  function escape(code) {
    {
      let str = code.toString(16);
      while (str.length < 4) str = "0" + str;
      return "\\u" + str;
    }
  }
  function replacer(match, backslashes, code) {
    if (backslashes.length % 2 === 0) {
      return match;
    }
    const char = String.fromCodePoint(parseInt(code, 16));
    const escaped = backslashes.slice(0, -1) + escape(char.charCodeAt(0));
    return char.length === 1 ? escaped : escaped + escape(char.charCodeAt(1));
  }
  function replaceUnicodeEscapes(str) {
    return str.replace(unicodeEscape, replacer);
  }
  function getUnicodeEscape(str) {
    let match;
    while (match = unicodeEscape.exec(str)) {
      if (match[1].length % 2 === 0) continue;
      unicodeEscape.lastIndex = 0;
      return match[0];
    }
    return null;
  }
  return {
    name: "transform-unicode-escapes",
    manipulateOptions({
      generatorOpts
    }) {
      var _generatorOpts$jsescO, _generatorOpts$jsescO2;
      if (!generatorOpts.jsescOption) {
        generatorOpts.jsescOption = {};
      }
      (_generatorOpts$jsescO2 = (_generatorOpts$jsescO = generatorOpts.jsescOption).minimal) != null ? _generatorOpts$jsescO2 : _generatorOpts$jsescO.minimal = false;
    },
    visitor: {
      Identifier(path) {
        const {
          node,
          key
        } = path;
        const {
          name
        } = node;
        const replaced = name.replace(surrogate, c => {
          return `_u${c.charCodeAt(0).toString(16)}`;
        });
        if (name === replaced) return;
        const str = _core.types.inherits(_core.types.stringLiteral(name), node);
        if (key === "key") {
          path.replaceWith(str);
          return;
        }
        const {
          parentPath,
          scope
        } = path;
        if (parentPath.isMemberExpression({
          property: node
        }) || parentPath.isOptionalMemberExpression({
          property: node
        })) {
          parentPath.node.computed = true;
          path.replaceWith(str);
          return;
        }
        const binding = scope.getBinding(name);
        if (binding) {
          scope.rename(name, scope.generateUid(replaced));
          return;
        }
        throw path.buildCodeFrameError(`Can't reference '${name}' as a bare identifier`);
      },
      "StringLiteral|DirectiveLiteral"(path) {
        const {
          node
        } = path;
        const {
          extra
        } = node;
        if (extra != null && extra.raw) extra.raw = replaceUnicodeEscapes(extra.raw);
      },
      TemplateElement(path) {
        const {
          node,
          parentPath
        } = path;
        const {
          value
        } = node;
        const firstEscape = getUnicodeEscape(value.raw);
        if (!firstEscape) return;
        const grandParent = parentPath.parentPath;
        if (grandParent.isTaggedTemplateExpression()) {
          throw path.buildCodeFrameError(`Can't replace Unicode escape '${firstEscape}' inside tagged template literals. You can enable '@babel/plugin-transform-template-literals' to compile them to classic strings.`);
        }
        value.raw = replaceUnicodeEscapes(value.raw);
      }
    }
  };
});
exports.default = _default;

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841866);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/core"]
//# sourceMappingURL=index.js.map