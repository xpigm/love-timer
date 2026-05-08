module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841852, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _regeneratorTransform = require("regenerator-transform");
var _default = (0, _helperPluginUtils.declare)(({
  types: t,
  assertVersion
}) => {
  assertVersion(7);
  return {
    name: "transform-regenerator",
    inherits: _regeneratorTransform.default,
    visitor: {
      MemberExpression(path) {
        {
          var _this$availableHelper;
          if (!((_this$availableHelper = this.availableHelper) != null && _this$availableHelper.call(this, "regeneratorRuntime"))) {
            return;
          }
        }
        const obj = path.get("object");
        if (obj.isIdentifier({
          name: "regeneratorRuntime"
        })) {
          const helper = this.addHelper("regeneratorRuntime");
          {
            if (t.isArrowFunctionExpression(helper)) {
              obj.replaceWith(helper.body);
              return;
            }
          }
          obj.replaceWith(t.callExpression(helper, []));
        }
      }
    }
  };
});
exports.default = _default;

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841852);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","regenerator-transform"]
//# sourceMappingURL=index.js.map