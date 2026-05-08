module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841539, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _pluginSyntaxPrivatePropertyInObject = require("@babel/plugin-syntax-private-property-in-object");
var _helperCreateClassFeaturesPlugin = require("@babel/helper-create-class-features-plugin");
var _helperAnnotateAsPure = require("@babel/helper-annotate-as-pure");
var _default = (0, _helperPluginUtils.declare)((api, opt) => {
  api.assertVersion(7);
  const {
    types: t,
    template
  } = api;
  const {
    loose
  } = opt;
  const classWeakSets = new WeakMap();
  const fieldsWeakSets = new WeakMap();
  function unshadow(name, targetScope, scope) {
    while (scope !== targetScope) {
      if (scope.hasOwnBinding(name)) scope.rename(name);
      scope = scope.parent;
    }
  }
  function injectToFieldInit(fieldPath, expr, before = false) {
    if (fieldPath.node.value) {
      const value = fieldPath.get("value");
      if (before) {
        value.insertBefore(expr);
      } else {
        value.insertAfter(expr);
      }
    } else {
      fieldPath.set("value", t.unaryExpression("void", expr));
    }
  }
  function injectInitialization(classPath, init) {
    let firstFieldPath;
    let constructorPath;
    for (const el of classPath.get("body.body")) {
      if ((el.isClassProperty() || el.isClassPrivateProperty()) && !el.node.static) {
        firstFieldPath = el;
        break;
      }
      if (!constructorPath && el.isClassMethod({
        kind: "constructor"
      })) {
        constructorPath = el;
      }
    }
    if (firstFieldPath) {
      injectToFieldInit(firstFieldPath, init, true);
    } else {
      (0, _helperCreateClassFeaturesPlugin.injectInitialization)(classPath, constructorPath, [t.expressionStatement(init)]);
    }
  }
  function getWeakSetId(weakSets, outerClass, reference, name = "", inject) {
    let id = weakSets.get(reference.node);
    if (!id) {
      id = outerClass.scope.generateUidIdentifier(`${name || ""} brandCheck`);
      weakSets.set(reference.node, id);
      inject(reference, template.expression.ast`${t.cloneNode(id)}.add(this)`);
      const newExpr = t.newExpression(t.identifier("WeakSet"), []);
      (0, _helperAnnotateAsPure.default)(newExpr);
      outerClass.insertBefore(template.ast`var ${id} = ${newExpr}`);
    }
    return t.cloneNode(id);
  }
  return {
    name: "proposal-private-property-in-object",
    inherits: _pluginSyntaxPrivatePropertyInObject.default,
    pre() {
      (0, _helperCreateClassFeaturesPlugin.enableFeature)(this.file, _helperCreateClassFeaturesPlugin.FEATURES.privateIn, loose);
    },
    visitor: {
      BinaryExpression(path, state) {
        const {
          node
        } = path;
        const {
          file
        } = state;
        if (node.operator !== "in") return;
        if (!t.isPrivateName(node.left)) return;
        const {
          name
        } = node.left.id;
        let privateElement;
        const outerClass = path.findParent(path => {
          if (!path.isClass()) return false;
          privateElement = path.get("body.body").find(({
            node
          }) => t.isPrivate(node) && node.key.id.name === name);
          return !!privateElement;
        });
        if (outerClass.parentPath.scope.path.isPattern()) {
          outerClass.replaceWith(template.ast`(() => ${outerClass.node})()`);
          return;
        }
        if (privateElement.node.type === "ClassPrivateMethod") {
          if (privateElement.node.static) {
            if (outerClass.node.id) {
              unshadow(outerClass.node.id.name, outerClass.scope, path.scope);
            } else {
              outerClass.set("id", path.scope.generateUidIdentifier("class"));
            }
            path.replaceWith(template.expression.ast`
                ${t.cloneNode(outerClass.node.id)} === ${(0, _helperCreateClassFeaturesPlugin.buildCheckInRHS)(node.right, file)}
              `);
          } else {
            var _outerClass$node$id;
            const id = getWeakSetId(classWeakSets, outerClass, outerClass, (_outerClass$node$id = outerClass.node.id) == null ? void 0 : _outerClass$node$id.name, injectInitialization);
            path.replaceWith(template.expression.ast`${id}.has(${(0, _helperCreateClassFeaturesPlugin.buildCheckInRHS)(node.right, file)})`);
          }
        } else {
          const id = getWeakSetId(fieldsWeakSets, outerClass, privateElement, privateElement.node.key.id.name, injectToFieldInit);
          path.replaceWith(template.expression.ast`${id}.has(${(0, _helperCreateClassFeaturesPlugin.buildCheckInRHS)(node.right, file)})`);
        }
      }
    }
  };
});
exports.default = _default;

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841539);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/plugin-syntax-private-property-in-object","@babel/helper-create-class-features-plugin","@babel/helper-annotate-as-pure"]
//# sourceMappingURL=index.js.map