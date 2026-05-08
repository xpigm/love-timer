module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841098, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "FEATURES", {
  enumerable: true,
  get: function () {
    return _features.FEATURES;
  }
});
Object.defineProperty(exports, "buildCheckInRHS", {
  enumerable: true,
  get: function () {
    return _fields.buildCheckInRHS;
  }
});
exports.createClassFeaturePlugin = createClassFeaturePlugin;
Object.defineProperty(exports, "enableFeature", {
  enumerable: true,
  get: function () {
    return _features.enableFeature;
  }
});
Object.defineProperty(exports, "injectInitialization", {
  enumerable: true,
  get: function () {
    return _misc.injectInitialization;
  }
});
var _core = require("@babel/core");
var _helperFunctionName = require("@babel/helper-function-name");
var _helperSplitExportDeclaration = require("@babel/helper-split-export-declaration");
var _semver = require("semver");
var _fields = require("./fields");
var _decorators = require("./decorators");
var _misc = require("./misc");
var _features = require("./features");
var _typescript = require("./typescript");
const versionKey = "@babel/plugin-class-features/version";
function createClassFeaturePlugin({
  name,
  feature,
  loose,
  manipulateOptions,
  api,
  inherits
}) {
  {
    var _api;
    (_api = api) != null ? _api : api = {
      assumption: () => void 0
    };
  }
  const setPublicClassFields = api.assumption("setPublicClassFields");
  const privateFieldsAsSymbols = api.assumption("privateFieldsAsSymbols");
  const privateFieldsAsProperties = api.assumption("privateFieldsAsProperties");
  const constantSuper = api.assumption("constantSuper");
  const noDocumentAll = api.assumption("noDocumentAll");
  if (privateFieldsAsProperties && privateFieldsAsSymbols) {
    throw new Error(`Cannot enable both the "privateFieldsAsProperties" and ` + `"privateFieldsAsSymbols" assumptions as the same time.`);
  }
  const privateFieldsAsSymbolsOrProperties = privateFieldsAsProperties || privateFieldsAsSymbols;
  if (loose === true) {
    const explicit = [];
    if (setPublicClassFields !== undefined) {
      explicit.push(`"setPublicClassFields"`);
    }
    if (privateFieldsAsProperties !== undefined) {
      explicit.push(`"privateFieldsAsProperties"`);
    }
    if (privateFieldsAsSymbols !== undefined) {
      explicit.push(`"privateFieldsAsSymbols"`);
    }
    if (explicit.length !== 0) {
      console.warn(`[${name}]: You are using the "loose: true" option and you are` + ` explicitly setting a value for the ${explicit.join(" and ")}` + ` assumption${explicit.length > 1 ? "s" : ""}. The "loose" option` + ` can cause incompatibilities with the other class features` + ` plugins, so it's recommended that you replace it with the` + ` following top-level option:\n` + `\t"assumptions": {\n` + `\t\t"setPublicClassFields": true,\n` + `\t\t"privateFieldsAsSymbols": true\n` + `\t}`);
    }
  }
  return {
    name,
    manipulateOptions,
    inherits,
    pre(file) {
      (0, _features.enableFeature)(file, feature, loose);
      {
        if (typeof file.get(versionKey) === "number") {
          file.set(versionKey, "7.22.10");
          return;
        }
      }
      if (!file.get(versionKey) || _semver.lt(file.get(versionKey), "7.22.10")) {
        file.set(versionKey, "7.22.10");
      }
    },
    visitor: {
      Class(path, {
        file
      }) {
        var _ref;
        if (file.get(versionKey) !== "7.22.10") return;
        if (!(0, _features.shouldTransform)(path, file)) return;
        const pathIsClassDeclaration = path.isClassDeclaration();
        if (pathIsClassDeclaration) (0, _typescript.assertFieldTransformed)(path);
        const loose = (0, _features.isLoose)(file, feature);
        let constructor;
        const isDecorated = (0, _decorators.hasDecorators)(path.node);
        const props = [];
        const elements = [];
        const computedPaths = [];
        const privateNames = new Set();
        const body = path.get("body");
        for (const path of body.get("body")) {
          if ((path.isClassProperty() || path.isClassMethod()) && path.node.computed) {
            computedPaths.push(path);
          }
          if (path.isPrivate()) {
            const {
              name
            } = path.node.key.id;
            const getName = `get ${name}`;
            const setName = `set ${name}`;
            if (path.isClassPrivateMethod()) {
              if (path.node.kind === "get") {
                if (privateNames.has(getName) || privateNames.has(name) && !privateNames.has(setName)) {
                  throw path.buildCodeFrameError("Duplicate private field");
                }
                privateNames.add(getName).add(name);
              } else if (path.node.kind === "set") {
                if (privateNames.has(setName) || privateNames.has(name) && !privateNames.has(getName)) {
                  throw path.buildCodeFrameError("Duplicate private field");
                }
                privateNames.add(setName).add(name);
              }
            } else {
              if (privateNames.has(name) && !privateNames.has(getName) && !privateNames.has(setName) || privateNames.has(name) && (privateNames.has(getName) || privateNames.has(setName))) {
                throw path.buildCodeFrameError("Duplicate private field");
              }
              privateNames.add(name);
            }
          }
          if (path.isClassMethod({
            kind: "constructor"
          })) {
            constructor = path;
          } else {
            elements.push(path);
            if (path.isProperty() || path.isPrivate() || path.isStaticBlock != null && path.isStaticBlock()) {
              props.push(path);
            }
          }
        }
        {
          if (!props.length && !isDecorated) return;
        }
        const innerBinding = path.node.id;
        let ref;
        if (!innerBinding || !pathIsClassDeclaration) {
          (0, _helperFunctionName.default)(path);
          ref = path.scope.generateUidIdentifier("class");
        }
        const classRefForDefine = (_ref = ref) != null ? _ref : _core.types.cloneNode(innerBinding);
        const privateNamesMap = (0, _fields.buildPrivateNamesMap)(props);
        const privateNamesNodes = (0, _fields.buildPrivateNamesNodes)(privateNamesMap, privateFieldsAsProperties != null ? privateFieldsAsProperties : loose, privateFieldsAsSymbols != null ? privateFieldsAsSymbols : false, file);
        (0, _fields.transformPrivateNamesUsage)(classRefForDefine, path, privateNamesMap, {
          privateFieldsAsProperties: privateFieldsAsSymbolsOrProperties != null ? privateFieldsAsSymbolsOrProperties : loose,
          noDocumentAll,
          innerBinding
        }, file);
        let keysNodes, staticNodes, instanceNodes, pureStaticNodes, classBindingNode, wrapClass;
        {
          if (isDecorated) {
            staticNodes = pureStaticNodes = keysNodes = [];
            ({
              instanceNodes,
              wrapClass
            } = (0, _decorators.buildDecoratedClass)(classRefForDefine, path, elements, file));
          } else {
            keysNodes = (0, _misc.extractComputedKeys)(path, computedPaths, file);
            ({
              staticNodes,
              pureStaticNodes,
              instanceNodes,
              classBindingNode,
              wrapClass
            } = (0, _fields.buildFieldsInitNodes)(ref, path.node.superClass, props, privateNamesMap, file, setPublicClassFields != null ? setPublicClassFields : loose, privateFieldsAsSymbolsOrProperties != null ? privateFieldsAsSymbolsOrProperties : loose, constantSuper != null ? constantSuper : loose, innerBinding));
          }
        }
        if (instanceNodes.length > 0) {
          (0, _misc.injectInitialization)(path, constructor, instanceNodes, (referenceVisitor, state) => {
            {
              if (isDecorated) return;
            }
            for (const prop of props) {
              if (_core.types.isStaticBlock != null && _core.types.isStaticBlock(prop.node) || prop.node.static) continue;
              prop.traverse(referenceVisitor, state);
            }
          });
        }
        const wrappedPath = wrapClass(path);
        wrappedPath.insertBefore([...privateNamesNodes, ...keysNodes]);
        if (staticNodes.length > 0) {
          wrappedPath.insertAfter(staticNodes);
        }
        if (pureStaticNodes.length > 0) {
          wrappedPath.find(parent => parent.isStatement() || parent.isDeclaration()).insertAfter(pureStaticNodes);
        }
        if (classBindingNode != null && pathIsClassDeclaration) {
          wrappedPath.insertAfter(classBindingNode);
        }
      },
      ExportDefaultDeclaration(path, {
        file
      }) {
        {
          if (file.get(versionKey) !== "7.22.10") return;
          const decl = path.get("declaration");
          if (decl.isClassDeclaration() && (0, _decorators.hasDecorators)(decl.node)) {
            if (decl.node.id) {
              (0, _helperSplitExportDeclaration.default)(path);
            } else {
              decl.node.type = "ClassExpression";
            }
          }
        }
      }
    }
  };
}

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./fields":1778207841099,"./decorators":1778207841101,"./misc":1778207841102,"./features":1778207841103,"./typescript":1778207841100}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841099, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildCheckInRHS = buildCheckInRHS;
exports.buildFieldsInitNodes = buildFieldsInitNodes;
exports.buildPrivateNamesMap = buildPrivateNamesMap;
exports.buildPrivateNamesNodes = buildPrivateNamesNodes;
exports.transformPrivateNamesUsage = transformPrivateNamesUsage;
var _core = require("@babel/core");
var _helperReplaceSupers = require("@babel/helper-replace-supers");
var _helperEnvironmentVisitor = require("@babel/helper-environment-visitor");
var _helperMemberExpressionToFunctions = require("@babel/helper-member-expression-to-functions");
var _helperOptimiseCallExpression = require("@babel/helper-optimise-call-expression");
var _helperAnnotateAsPure = require("@babel/helper-annotate-as-pure");
var _helperSkipTransparentExpressionWrappers = require("@babel/helper-skip-transparent-expression-wrappers");
var ts = require("./typescript");
function buildPrivateNamesMap(props) {
  const privateNamesMap = new Map();
  for (const prop of props) {
    if (prop.isPrivate()) {
      const {
        name
      } = prop.node.key.id;
      const update = privateNamesMap.has(name) ? privateNamesMap.get(name) : {
        id: prop.scope.generateUidIdentifier(name),
        static: prop.node.static,
        method: !prop.isProperty()
      };
      if (prop.isClassPrivateMethod()) {
        if (prop.node.kind === "get") {
          update.getId = prop.scope.generateUidIdentifier(`get_${name}`);
        } else if (prop.node.kind === "set") {
          update.setId = prop.scope.generateUidIdentifier(`set_${name}`);
        } else if (prop.node.kind === "method") {
          update.methodId = prop.scope.generateUidIdentifier(name);
        }
      }
      privateNamesMap.set(name, update);
    }
  }
  return privateNamesMap;
}
function buildPrivateNamesNodes(privateNamesMap, privateFieldsAsProperties, privateFieldsAsSymbols, state) {
  const initNodes = [];
  for (const [name, value] of privateNamesMap) {
    const {
      static: isStatic,
      method: isMethod,
      getId,
      setId
    } = value;
    const isAccessor = getId || setId;
    const id = _core.types.cloneNode(value.id);
    let init;
    if (privateFieldsAsProperties) {
      init = _core.types.callExpression(state.addHelper("classPrivateFieldLooseKey"), [_core.types.stringLiteral(name)]);
    } else if (privateFieldsAsSymbols) {
      init = _core.types.callExpression(_core.types.identifier("Symbol"), [_core.types.stringLiteral(name)]);
    } else if (!isStatic) {
      init = _core.types.newExpression(_core.types.identifier(!isMethod || isAccessor ? "WeakMap" : "WeakSet"), []);
    }
    if (init) {
      (0, _helperAnnotateAsPure.default)(init);
      initNodes.push(_core.template.statement.ast`var ${id} = ${init}`);
    }
  }
  return initNodes;
}
function privateNameVisitorFactory(visitor) {
  const nestedVisitor = _core.traverse.visitors.merge([Object.assign({}, visitor), _helperEnvironmentVisitor.default]);
  const privateNameVisitor = Object.assign({}, visitor, {
    Class(path) {
      const {
        privateNamesMap
      } = this;
      const body = path.get("body.body");
      const visiblePrivateNames = new Map(privateNamesMap);
      const redeclared = [];
      for (const prop of body) {
        if (!prop.isPrivate()) continue;
        const {
          name
        } = prop.node.key.id;
        visiblePrivateNames.delete(name);
        redeclared.push(name);
      }
      if (!redeclared.length) {
        return;
      }
      path.get("body").traverse(nestedVisitor, Object.assign({}, this, {
        redeclared
      }));
      path.traverse(privateNameVisitor, Object.assign({}, this, {
        privateNamesMap: visiblePrivateNames
      }));
      path.skipKey("body");
    }
  });
  return privateNameVisitor;
}
const privateNameVisitor = privateNameVisitorFactory({
  PrivateName(path, {
    noDocumentAll
  }) {
    const {
      privateNamesMap,
      redeclared
    } = this;
    const {
      node,
      parentPath
    } = path;
    if (!parentPath.isMemberExpression({
      property: node
    }) && !parentPath.isOptionalMemberExpression({
      property: node
    })) {
      return;
    }
    const {
      name
    } = node.id;
    if (!privateNamesMap.has(name)) return;
    if (redeclared && redeclared.includes(name)) return;
    this.handle(parentPath, noDocumentAll);
  }
});
function unshadow(name, scope, innerBinding) {
  while ((_scope = scope) != null && _scope.hasBinding(name) && !scope.bindingIdentifierEquals(name, innerBinding)) {
    var _scope;
    scope.rename(name);
    scope = scope.parent;
  }
}
function buildCheckInRHS(rhs, file, inRHSIsObject) {
  if (inRHSIsObject || !(file.availableHelper != null && file.availableHelper("checkInRHS"))) return rhs;
  return _core.types.callExpression(file.addHelper("checkInRHS"), [rhs]);
}
const privateInVisitor = privateNameVisitorFactory({
  BinaryExpression(path, {
    file
  }) {
    const {
      operator,
      left,
      right
    } = path.node;
    if (operator !== "in") return;
    if (!_core.types.isPrivateName(left)) return;
    const {
      privateFieldsAsProperties,
      privateNamesMap,
      redeclared
    } = this;
    const {
      name
    } = left.id;
    if (!privateNamesMap.has(name)) return;
    if (redeclared && redeclared.includes(name)) return;
    unshadow(this.classRef.name, path.scope, this.innerBinding);
    if (privateFieldsAsProperties) {
      const {
        id
      } = privateNamesMap.get(name);
      path.replaceWith(_core.template.expression.ast`
        Object.prototype.hasOwnProperty.call(${buildCheckInRHS(right, file)}, ${_core.types.cloneNode(id)})
      `);
      return;
    }
    const {
      id,
      static: isStatic
    } = privateNamesMap.get(name);
    if (isStatic) {
      path.replaceWith(_core.template.expression.ast`${buildCheckInRHS(right, file)} === ${_core.types.cloneNode(this.classRef)}`);
      return;
    }
    path.replaceWith(_core.template.expression.ast`${_core.types.cloneNode(id)}.has(${buildCheckInRHS(right, file)})`);
  }
});
const privateNameHandlerSpec = {
  memoise(member, count) {
    const {
      scope
    } = member;
    const {
      object
    } = member.node;
    const memo = scope.maybeGenerateMemoised(object);
    if (!memo) {
      return;
    }
    this.memoiser.set(object, memo, count);
  },
  receiver(member) {
    const {
      object
    } = member.node;
    if (this.memoiser.has(object)) {
      return _core.types.cloneNode(this.memoiser.get(object));
    }
    return _core.types.cloneNode(object);
  },
  get(member) {
    const {
      classRef,
      privateNamesMap,
      file,
      innerBinding
    } = this;
    const {
      name
    } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod,
      methodId,
      getId,
      setId
    } = privateNamesMap.get(name);
    const isAccessor = getId || setId;
    if (isStatic) {
      const helperName = isMethod && !isAccessor ? "classStaticPrivateMethodGet" : "classStaticPrivateFieldSpecGet";
      unshadow(classRef.name, member.scope, innerBinding);
      return _core.types.callExpression(file.addHelper(helperName), [this.receiver(member), _core.types.cloneNode(classRef), _core.types.cloneNode(id)]);
    }
    if (isMethod) {
      if (isAccessor) {
        if (!getId && setId) {
          if (file.availableHelper("writeOnlyError")) {
            return _core.types.sequenceExpression([this.receiver(member), _core.types.callExpression(file.addHelper("writeOnlyError"), [_core.types.stringLiteral(`#${name}`)])]);
          }
          console.warn(`@babel/helpers is outdated, update it to silence this warning.`);
        }
        return _core.types.callExpression(file.addHelper("classPrivateFieldGet"), [this.receiver(member), _core.types.cloneNode(id)]);
      }
      return _core.types.callExpression(file.addHelper("classPrivateMethodGet"), [this.receiver(member), _core.types.cloneNode(id), _core.types.cloneNode(methodId)]);
    }
    return _core.types.callExpression(file.addHelper("classPrivateFieldGet"), [this.receiver(member), _core.types.cloneNode(id)]);
  },
  boundGet(member) {
    this.memoise(member, 1);
    return _core.types.callExpression(_core.types.memberExpression(this.get(member), _core.types.identifier("bind")), [this.receiver(member)]);
  },
  set(member, value) {
    const {
      classRef,
      privateNamesMap,
      file
    } = this;
    const {
      name
    } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod,
      setId,
      getId
    } = privateNamesMap.get(name);
    const isAccessor = getId || setId;
    if (isStatic) {
      const helperName = isMethod && !isAccessor ? "classStaticPrivateMethodSet" : "classStaticPrivateFieldSpecSet";
      return _core.types.callExpression(file.addHelper(helperName), [this.receiver(member), _core.types.cloneNode(classRef), _core.types.cloneNode(id), value]);
    }
    if (isMethod) {
      if (setId) {
        return _core.types.callExpression(file.addHelper("classPrivateFieldSet"), [this.receiver(member), _core.types.cloneNode(id), value]);
      }
      return _core.types.sequenceExpression([this.receiver(member), value, _core.types.callExpression(file.addHelper("readOnlyError"), [_core.types.stringLiteral(`#${name}`)])]);
    }
    return _core.types.callExpression(file.addHelper("classPrivateFieldSet"), [this.receiver(member), _core.types.cloneNode(id), value]);
  },
  destructureSet(member) {
    const {
      classRef,
      privateNamesMap,
      file
    } = this;
    const {
      name
    } = member.node.property.id;
    const {
      id,
      static: isStatic
    } = privateNamesMap.get(name);
    if (isStatic) {
      try {
        var helper = file.addHelper("classStaticPrivateFieldDestructureSet");
      } catch (_unused) {
        throw new Error("Babel can not transpile `[C.#p] = [0]` with @babel/helpers < 7.13.10, \n" + "please update @babel/helpers to the latest version.");
      }
      return _core.types.memberExpression(_core.types.callExpression(helper, [this.receiver(member), _core.types.cloneNode(classRef), _core.types.cloneNode(id)]), _core.types.identifier("value"));
    }
    return _core.types.memberExpression(_core.types.callExpression(file.addHelper("classPrivateFieldDestructureSet"), [this.receiver(member), _core.types.cloneNode(id)]), _core.types.identifier("value"));
  },
  call(member, args) {
    this.memoise(member, 1);
    return (0, _helperOptimiseCallExpression.default)(this.get(member), this.receiver(member), args, false);
  },
  optionalCall(member, args) {
    this.memoise(member, 1);
    return (0, _helperOptimiseCallExpression.default)(this.get(member), this.receiver(member), args, true);
  },
  delete() {
    throw new Error("Internal Babel error: deleting private elements is a parsing error.");
  }
};
const privateNameHandlerLoose = {
  get(member) {
    const {
      privateNamesMap,
      file
    } = this;
    const {
      object
    } = member.node;
    const {
      name
    } = member.node.property.id;
    return _core.template.expression`BASE(REF, PROP)[PROP]`({
      BASE: file.addHelper("classPrivateFieldLooseBase"),
      REF: _core.types.cloneNode(object),
      PROP: _core.types.cloneNode(privateNamesMap.get(name).id)
    });
  },
  set() {
    throw new Error("private name handler with loose = true don't need set()");
  },
  boundGet(member) {
    return _core.types.callExpression(_core.types.memberExpression(this.get(member), _core.types.identifier("bind")), [_core.types.cloneNode(member.node.object)]);
  },
  simpleSet(member) {
    return this.get(member);
  },
  destructureSet(member) {
    return this.get(member);
  },
  call(member, args) {
    return _core.types.callExpression(this.get(member), args);
  },
  optionalCall(member, args) {
    return _core.types.optionalCallExpression(this.get(member), args, true);
  },
  delete() {
    throw new Error("Internal Babel error: deleting private elements is a parsing error.");
  }
};
function transformPrivateNamesUsage(ref, path, privateNamesMap, {
  privateFieldsAsProperties,
  noDocumentAll,
  innerBinding
}, state) {
  if (!privateNamesMap.size) return;
  const body = path.get("body");
  const handler = privateFieldsAsProperties ? privateNameHandlerLoose : privateNameHandlerSpec;
  (0, _helperMemberExpressionToFunctions.default)(body, privateNameVisitor, Object.assign({
    privateNamesMap,
    classRef: ref,
    file: state
  }, handler, {
    noDocumentAll,
    innerBinding
  }));
  body.traverse(privateInVisitor, {
    privateNamesMap,
    classRef: ref,
    file: state,
    privateFieldsAsProperties,
    innerBinding
  });
}
function buildPrivateFieldInitLoose(ref, prop, privateNamesMap) {
  const {
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return inheritPropComments(_core.template.statement.ast`
      Object.defineProperty(${ref}, ${_core.types.cloneNode(id)}, {
        // configurable is false by default
        // enumerable is false by default
        writable: true,
        value: ${value}
      });
    `, prop);
}
function buildPrivateInstanceFieldInitSpec(ref, prop, privateNamesMap, state) {
  const {
    id
  } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  {
    if (!state.availableHelper("classPrivateFieldInitSpec")) {
      return inheritPropComments(_core.template.statement.ast`${_core.types.cloneNode(id)}.set(${ref}, {
          // configurable is always false for private elements
          // enumerable is always false for private elements
          writable: true,
          value: ${value},
        })`, prop);
    }
  }
  const helper = state.addHelper("classPrivateFieldInitSpec");
  return inheritPropComments(_core.template.statement.ast`${helper}(
      ${_core.types.thisExpression()},
      ${_core.types.cloneNode(id)},
      {
        writable: true,
        value: ${value}
      },
    )`, prop);
}
function buildPrivateStaticFieldInitSpec(prop, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    id,
    getId,
    setId,
    initAdded
  } = privateName;
  const isAccessor = getId || setId;
  if (!prop.isProperty() && (initAdded || !isAccessor)) return;
  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, Object.assign({}, privateName, {
      initAdded: true
    }));
    return inheritPropComments(_core.template.statement.ast`
        var ${_core.types.cloneNode(id)} = {
          // configurable is false by default
          // enumerable is false by default
          // writable is false by default
          get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
          set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
        }
      `, prop);
  }
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return inheritPropComments(_core.template.statement.ast`
      var ${_core.types.cloneNode(id)} = {
        // configurable is false by default
        // enumerable is false by default
        writable: true,
        value: ${value}
      };
    `, prop);
}
function buildPrivateMethodInitLoose(ref, prop, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    methodId,
    id,
    getId,
    setId,
    initAdded
  } = privateName;
  if (initAdded) return;
  if (methodId) {
    return inheritPropComments(_core.template.statement.ast`
        Object.defineProperty(${ref}, ${id}, {
          // configurable is false by default
          // enumerable is false by default
          // writable is false by default
          value: ${methodId.name}
        });
      `, prop);
  }
  const isAccessor = getId || setId;
  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, Object.assign({}, privateName, {
      initAdded: true
    }));
    return inheritPropComments(_core.template.statement.ast`
        Object.defineProperty(${ref}, ${id}, {
          // configurable is false by default
          // enumerable is false by default
          // writable is false by default
          get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
          set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
        });
      `, prop);
  }
}
function buildPrivateInstanceMethodInitSpec(ref, prop, privateNamesMap, state) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    getId,
    setId,
    initAdded
  } = privateName;
  if (initAdded) return;
  const isAccessor = getId || setId;
  if (isAccessor) {
    return buildPrivateAccessorInitialization(ref, prop, privateNamesMap, state);
  }
  return buildPrivateInstanceMethodInitialization(ref, prop, privateNamesMap, state);
}
function buildPrivateAccessorInitialization(ref, prop, privateNamesMap, state) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    id,
    getId,
    setId
  } = privateName;
  privateNamesMap.set(prop.node.key.id.name, Object.assign({}, privateName, {
    initAdded: true
  }));
  {
    if (!state.availableHelper("classPrivateFieldInitSpec")) {
      return inheritPropComments(_core.template.statement.ast`
          ${id}.set(${ref}, {
            get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
            set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
          });
        `, prop);
    }
  }
  const helper = state.addHelper("classPrivateFieldInitSpec");
  return inheritPropComments(_core.template.statement.ast`${helper}(
      ${_core.types.thisExpression()},
      ${_core.types.cloneNode(id)},
      {
        get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
        set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
      },
    )`, prop);
}
function buildPrivateInstanceMethodInitialization(ref, prop, privateNamesMap, state) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    id
  } = privateName;
  {
    if (!state.availableHelper("classPrivateMethodInitSpec")) {
      return inheritPropComments(_core.template.statement.ast`${id}.add(${ref})`, prop);
    }
  }
  const helper = state.addHelper("classPrivateMethodInitSpec");
  return inheritPropComments(_core.template.statement.ast`${helper}(
      ${_core.types.thisExpression()},
      ${_core.types.cloneNode(id)}
    )`, prop);
}
function buildPublicFieldInitLoose(ref, prop) {
  const {
    key,
    computed
  } = prop.node;
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return inheritPropComments(_core.types.expressionStatement(_core.types.assignmentExpression("=", _core.types.memberExpression(ref, key, computed || _core.types.isLiteral(key)), value)), prop);
}
function buildPublicFieldInitSpec(ref, prop, state) {
  const {
    key,
    computed
  } = prop.node;
  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return inheritPropComments(_core.types.expressionStatement(_core.types.callExpression(state.addHelper("defineProperty"), [ref, computed || _core.types.isLiteral(key) ? key : _core.types.stringLiteral(key.name), value])), prop);
}
function buildPrivateStaticMethodInitLoose(ref, prop, state, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    id,
    methodId,
    getId,
    setId,
    initAdded
  } = privateName;
  if (initAdded) return;
  const isAccessor = getId || setId;
  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, Object.assign({}, privateName, {
      initAdded: true
    }));
    return inheritPropComments(_core.template.statement.ast`
        Object.defineProperty(${ref}, ${id}, {
          // configurable is false by default
          // enumerable is false by default
          // writable is false by default
          get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
          set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
        })
      `, prop);
  }
  return inheritPropComments(_core.template.statement.ast`
      Object.defineProperty(${ref}, ${id}, {
        // configurable is false by default
        // enumerable is false by default
        // writable is false by default
        value: ${methodId.name}
      });
    `, prop);
}
function buildPrivateMethodDeclaration(prop, privateNamesMap, privateFieldsAsProperties = false) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    id,
    methodId,
    getId,
    setId,
    getterDeclared,
    setterDeclared,
    static: isStatic
  } = privateName;
  const {
    params,
    body,
    generator,
    async
  } = prop.node;
  const isGetter = getId && !getterDeclared && params.length === 0;
  const isSetter = setId && !setterDeclared && params.length > 0;
  let declId = methodId;
  if (isGetter) {
    privateNamesMap.set(prop.node.key.id.name, Object.assign({}, privateName, {
      getterDeclared: true
    }));
    declId = getId;
  } else if (isSetter) {
    privateNamesMap.set(prop.node.key.id.name, Object.assign({}, privateName, {
      setterDeclared: true
    }));
    declId = setId;
  } else if (isStatic && !privateFieldsAsProperties) {
    declId = id;
  }
  return inheritPropComments(_core.types.functionDeclaration(_core.types.cloneNode(declId), params, body, generator, async), prop);
}
const thisContextVisitor = _core.traverse.visitors.merge([{
  UnaryExpression(path) {
    const {
      node
    } = path;
    if (node.operator === "delete") {
      const argument = (0, _helperSkipTransparentExpressionWrappers.skipTransparentExprWrapperNodes)(node.argument);
      if (_core.types.isThisExpression(argument)) {
        path.replaceWith(_core.types.booleanLiteral(true));
      }
    }
  },
  ThisExpression(path, state) {
    state.needsClassRef = true;
    path.replaceWith(_core.types.cloneNode(state.classRef));
  },
  MetaProperty(path) {
    const {
      node,
      scope
    } = path;
    if (node.meta.name === "new" && node.property.name === "target") {
      path.replaceWith(scope.buildUndefinedNode());
    }
  }
}, _helperEnvironmentVisitor.default]);
const innerReferencesVisitor = {
  ReferencedIdentifier(path, state) {
    if (path.scope.bindingIdentifierEquals(path.node.name, state.innerBinding)) {
      state.needsClassRef = true;
      path.node.name = state.classRef.name;
    }
  }
};
function replaceThisContext(path, ref, innerBindingRef) {
  var _state$classRef;
  const state = {
    classRef: ref,
    needsClassRef: false,
    innerBinding: innerBindingRef
  };
  if (!path.isMethod()) {
    path.traverse(thisContextVisitor, state);
  }
  if (innerBindingRef != null && (_state$classRef = state.classRef) != null && _state$classRef.name && state.classRef.name !== innerBindingRef.name) {
    path.traverse(innerReferencesVisitor, state);
  }
  return state.needsClassRef;
}
function isNameOrLength({
  key,
  computed
}) {
  if (key.type === "Identifier") {
    return !computed && (key.name === "name" || key.name === "length");
  }
  if (key.type === "StringLiteral") {
    return key.value === "name" || key.value === "length";
  }
  return false;
}
function inheritPropComments(node, prop) {
  _core.types.inheritLeadingComments(node, prop.node);
  _core.types.inheritInnerComments(node, prop.node);
  return node;
}
function buildFieldsInitNodes(ref, superRef, props, privateNamesMap, file, setPublicClassFields, privateFieldsAsProperties, constantSuper, innerBindingRef) {
  var _ref, _ref2;
  let classRefFlags = 0;
  let injectSuperRef;
  const staticNodes = [];
  const instanceNodes = [];
  const pureStaticNodes = [];
  let classBindingNode = null;
  const getSuperRef = _core.types.isIdentifier(superRef) ? () => superRef : () => {
    var _injectSuperRef;
    (_injectSuperRef = injectSuperRef) != null ? _injectSuperRef : injectSuperRef = props[0].scope.generateUidIdentifierBasedOnNode(superRef);
    return injectSuperRef;
  };
  const classRefForInnerBinding = (_ref = ref) != null ? _ref : props[0].scope.generateUidIdentifier("class");
  (_ref2 = ref) != null ? _ref2 : ref = _core.types.cloneNode(innerBindingRef);
  for (const prop of props) {
    prop.isClassProperty() && ts.assertFieldTransformed(prop);
    const isStatic = !(_core.types.isStaticBlock != null && _core.types.isStaticBlock(prop.node)) && prop.node.static;
    const isInstance = !isStatic;
    const isPrivate = prop.isPrivate();
    const isPublic = !isPrivate;
    const isField = prop.isProperty();
    const isMethod = !isField;
    const isStaticBlock = prop.isStaticBlock == null ? void 0 : prop.isStaticBlock();
    if (isStatic) classRefFlags |= 1;
    if (isStatic || isMethod && isPrivate || isStaticBlock) {
      new _helperReplaceSupers.default({
        methodPath: prop,
        constantSuper,
        file: file,
        refToPreserve: innerBindingRef,
        getSuperRef,
        getObjectRef() {
          classRefFlags |= 2;
          if (isStatic || isStaticBlock) {
            return classRefForInnerBinding;
          } else {
            return _core.types.memberExpression(classRefForInnerBinding, _core.types.identifier("prototype"));
          }
        }
      }).replace();
      const replaced = replaceThisContext(prop, classRefForInnerBinding, innerBindingRef);
      if (replaced) {
        classRefFlags |= 2;
      }
    }
    switch (true) {
      case isStaticBlock:
        {
          const blockBody = prop.node.body;
          if (blockBody.length === 1 && _core.types.isExpressionStatement(blockBody[0])) {
            staticNodes.push(inheritPropComments(blockBody[0], prop));
          } else {
            staticNodes.push(_core.types.inheritsComments(_core.template.statement.ast`(() => { ${blockBody} })()`, prop.node));
          }
          break;
        }
      case isStatic && isPrivate && isField && privateFieldsAsProperties:
        staticNodes.push(buildPrivateFieldInitLoose(_core.types.cloneNode(ref), prop, privateNamesMap));
        break;
      case isStatic && isPrivate && isField && !privateFieldsAsProperties:
        staticNodes.push(buildPrivateStaticFieldInitSpec(prop, privateNamesMap));
        break;
      case isStatic && isPublic && isField && setPublicClassFields:
        if (!isNameOrLength(prop.node)) {
          staticNodes.push(buildPublicFieldInitLoose(_core.types.cloneNode(ref), prop));
          break;
        }
      case isStatic && isPublic && isField && !setPublicClassFields:
        staticNodes.push(buildPublicFieldInitSpec(_core.types.cloneNode(ref), prop, file));
        break;
      case isInstance && isPrivate && isField && privateFieldsAsProperties:
        instanceNodes.push(buildPrivateFieldInitLoose(_core.types.thisExpression(), prop, privateNamesMap));
        break;
      case isInstance && isPrivate && isField && !privateFieldsAsProperties:
        instanceNodes.push(buildPrivateInstanceFieldInitSpec(_core.types.thisExpression(), prop, privateNamesMap, file));
        break;
      case isInstance && isPrivate && isMethod && privateFieldsAsProperties:
        instanceNodes.unshift(buildPrivateMethodInitLoose(_core.types.thisExpression(), prop, privateNamesMap));
        pureStaticNodes.push(buildPrivateMethodDeclaration(prop, privateNamesMap, privateFieldsAsProperties));
        break;
      case isInstance && isPrivate && isMethod && !privateFieldsAsProperties:
        instanceNodes.unshift(buildPrivateInstanceMethodInitSpec(_core.types.thisExpression(), prop, privateNamesMap, file));
        pureStaticNodes.push(buildPrivateMethodDeclaration(prop, privateNamesMap, privateFieldsAsProperties));
        break;
      case isStatic && isPrivate && isMethod && !privateFieldsAsProperties:
        staticNodes.unshift(buildPrivateStaticFieldInitSpec(prop, privateNamesMap));
        pureStaticNodes.push(buildPrivateMethodDeclaration(prop, privateNamesMap, privateFieldsAsProperties));
        break;
      case isStatic && isPrivate && isMethod && privateFieldsAsProperties:
        staticNodes.unshift(buildPrivateStaticMethodInitLoose(_core.types.cloneNode(ref), prop, file, privateNamesMap));
        pureStaticNodes.push(buildPrivateMethodDeclaration(prop, privateNamesMap, privateFieldsAsProperties));
        break;
      case isInstance && isPublic && isField && setPublicClassFields:
        instanceNodes.push(buildPublicFieldInitLoose(_core.types.thisExpression(), prop));
        break;
      case isInstance && isPublic && isField && !setPublicClassFields:
        instanceNodes.push(buildPublicFieldInitSpec(_core.types.thisExpression(), prop, file));
        break;
      default:
        throw new Error("Unreachable.");
    }
  }
  if (classRefFlags & 2 && innerBindingRef != null) {
    classBindingNode = _core.types.expressionStatement(_core.types.assignmentExpression("=", _core.types.cloneNode(classRefForInnerBinding), _core.types.cloneNode(innerBindingRef)));
  }
  return {
    staticNodes: staticNodes.filter(Boolean),
    instanceNodes: instanceNodes.filter(Boolean),
    pureStaticNodes: pureStaticNodes.filter(Boolean),
    classBindingNode,
    wrapClass(path) {
      for (const prop of props) {
        prop.node.leadingComments = null;
        prop.remove();
      }
      if (injectSuperRef) {
        path.scope.push({
          id: _core.types.cloneNode(injectSuperRef)
        });
        path.set("superClass", _core.types.assignmentExpression("=", injectSuperRef, path.node.superClass));
      }
      if (classRefFlags !== 0) {
        if (path.isClassExpression()) {
          path.scope.push({
            id: ref
          });
          path.replaceWith(_core.types.assignmentExpression("=", _core.types.cloneNode(ref), path.node));
        } else {
          if (innerBindingRef == null) {
            path.node.id = ref;
          }
          if (classBindingNode != null) {
            path.scope.push({
              id: classRefForInnerBinding
            });
          }
        }
      }
      return path;
    }
  };
}

//# sourceMappingURL=fields.js.map

}, function(modId) { var map = {"./typescript":1778207841100}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841100, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertFieldTransformed = assertFieldTransformed;
function assertFieldTransformed(path) {
  if (path.node.declare || false) {
    throw path.buildCodeFrameError(`TypeScript 'declare' fields must first be transformed by ` + `@babel/plugin-transform-typescript.\n` + `If you have already enabled that plugin (or '@babel/preset-typescript'), make sure ` + `that it runs before any plugin related to additional class features:\n` + ` - @babel/plugin-transform-class-properties\n` + ` - @babel/plugin-transform-private-methods\n` + ` - @babel/plugin-proposal-decorators`);
  }
}

//# sourceMappingURL=typescript.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841101, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildDecoratedClass = buildDecoratedClass;
exports.hasDecorators = hasDecorators;
exports.hasOwnDecorators = hasOwnDecorators;
var _core = require("@babel/core");
var _helperReplaceSupers = require("@babel/helper-replace-supers");
var _helperFunctionName = require("@babel/helper-function-name");
function hasOwnDecorators(node) {
  var _node$decorators;
  return !!((_node$decorators = node.decorators) != null && _node$decorators.length);
}
function hasDecorators(node) {
  return hasOwnDecorators(node) || node.body.body.some(hasOwnDecorators);
}
function prop(key, value) {
  if (!value) return null;
  return _core.types.objectProperty(_core.types.identifier(key), value);
}
function method(key, body) {
  return _core.types.objectMethod("method", _core.types.identifier(key), [], _core.types.blockStatement(body));
}
function takeDecorators(node) {
  let result;
  if (node.decorators && node.decorators.length > 0) {
    result = _core.types.arrayExpression(node.decorators.map(decorator => decorator.expression));
  }
  node.decorators = undefined;
  return result;
}
function getKey(node) {
  if (node.computed) {
    return node.key;
  } else if (_core.types.isIdentifier(node.key)) {
    return _core.types.stringLiteral(node.key.name);
  } else {
    return _core.types.stringLiteral(String(node.key.value));
  }
}
function extractElementDescriptor(file, classRef, superRef, path) {
  const isMethod = path.isClassMethod();
  if (path.isPrivate()) {
    throw path.buildCodeFrameError(`Private ${isMethod ? "methods" : "fields"} in decorated classes are not supported yet.`);
  }
  if (path.node.type === "ClassAccessorProperty") {
    throw path.buildCodeFrameError(`Accessor properties are not supported in 2018-09 decorator transform, please specify { "version": "2021-12" } instead.`);
  }
  if (path.node.type === "StaticBlock") {
    throw path.buildCodeFrameError(`Static blocks are not supported in 2018-09 decorator transform, please specify { "version": "2021-12" } instead.`);
  }
  const {
    node,
    scope
  } = path;
  if (!path.isTSDeclareMethod()) {
    new _helperReplaceSupers.default({
      methodPath: path,
      objectRef: classRef,
      superRef,
      file,
      refToPreserve: classRef
    }).replace();
  }
  const properties = [prop("kind", _core.types.stringLiteral(_core.types.isClassMethod(node) ? node.kind : "field")), prop("decorators", takeDecorators(node)), prop("static", node.static && _core.types.booleanLiteral(true)), prop("key", getKey(node))].filter(Boolean);
  if (_core.types.isClassMethod(node)) {
    const id = node.computed ? null : node.key;
    const transformed = _core.types.toExpression(node);
    properties.push(prop("value", (0, _helperFunctionName.default)({
      node: transformed,
      id,
      scope
    }) || transformed));
  } else if (_core.types.isClassProperty(node) && node.value) {
    properties.push(method("value", _core.template.statements.ast`return ${node.value}`));
  } else {
    properties.push(prop("value", scope.buildUndefinedNode()));
  }
  path.remove();
  return _core.types.objectExpression(properties);
}
function addDecorateHelper(file) {
  return file.addHelper("decorate");
}
function buildDecoratedClass(ref, path, elements, file) {
  const {
    node,
    scope
  } = path;
  const initializeId = scope.generateUidIdentifier("initialize");
  const isDeclaration = node.id && path.isDeclaration();
  const isStrict = path.isInStrictMode();
  const {
    superClass
  } = node;
  node.type = "ClassDeclaration";
  if (!node.id) node.id = _core.types.cloneNode(ref);
  let superId;
  if (superClass) {
    superId = scope.generateUidIdentifierBasedOnNode(node.superClass, "super");
    node.superClass = superId;
  }
  const classDecorators = takeDecorators(node);
  const definitions = _core.types.arrayExpression(elements.filter(element => !element.node.abstract && element.node.type !== "TSIndexSignature").map(path => extractElementDescriptor(file, node.id, superId, path)));
  const wrapperCall = _core.template.expression.ast`
    ${addDecorateHelper(file)}(
      ${classDecorators || _core.types.nullLiteral()},
      function (${initializeId}, ${superClass ? _core.types.cloneNode(superId) : null}) {
        ${node}
        return { F: ${_core.types.cloneNode(node.id)}, d: ${definitions} };
      },
      ${superClass}
    )
  `;
  if (!isStrict) {
    wrapperCall.arguments[1].body.directives.push(_core.types.directive(_core.types.directiveLiteral("use strict")));
  }
  let replacement = wrapperCall;
  let classPathDesc = "arguments.1.body.body.0";
  if (isDeclaration) {
    replacement = _core.template.statement.ast`let ${ref} = ${wrapperCall}`;
    classPathDesc = "declarations.0.init." + classPathDesc;
  }
  return {
    instanceNodes: [_core.template.statement.ast`${_core.types.cloneNode(initializeId)}(this)`],
    wrapClass(path) {
      path.replaceWith(replacement);
      return path.get(classPathDesc);
    }
  };
}

//# sourceMappingURL=decorators.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841102, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractComputedKeys = extractComputedKeys;
exports.injectInitialization = injectInitialization;
var _core = require("@babel/core");
var _helperEnvironmentVisitor = require("@babel/helper-environment-visitor");
const findBareSupers = _core.traverse.visitors.merge([{
  Super(path) {
    const {
      node,
      parentPath
    } = path;
    if (parentPath.isCallExpression({
      callee: node
    })) {
      this.push(parentPath);
    }
  }
}, _helperEnvironmentVisitor.default]);
const referenceVisitor = {
  "TSTypeAnnotation|TypeAnnotation"(path) {
    path.skip();
  },
  ReferencedIdentifier(path, {
    scope
  }) {
    if (scope.hasOwnBinding(path.node.name)) {
      scope.rename(path.node.name);
      path.skip();
    }
  }
};
function handleClassTDZ(path, state) {
  if (state.classBinding && state.classBinding === path.scope.getBinding(path.node.name)) {
    const classNameTDZError = state.file.addHelper("classNameTDZError");
    const throwNode = _core.types.callExpression(classNameTDZError, [_core.types.stringLiteral(path.node.name)]);
    path.replaceWith(_core.types.sequenceExpression([throwNode, path.node]));
    path.skip();
  }
}
const classFieldDefinitionEvaluationTDZVisitor = {
  ReferencedIdentifier: handleClassTDZ
};
function injectInitialization(path, constructor, nodes, renamer) {
  if (!nodes.length) return;
  const isDerived = !!path.node.superClass;
  if (!constructor) {
    const newConstructor = _core.types.classMethod("constructor", _core.types.identifier("constructor"), [], _core.types.blockStatement([]));
    if (isDerived) {
      newConstructor.params = [_core.types.restElement(_core.types.identifier("args"))];
      newConstructor.body.body.push(_core.template.statement.ast`super(...args)`);
    }
    [constructor] = path.get("body").unshiftContainer("body", newConstructor);
  }
  if (renamer) {
    renamer(referenceVisitor, {
      scope: constructor.scope
    });
  }
  if (isDerived) {
    const bareSupers = [];
    constructor.traverse(findBareSupers, bareSupers);
    let isFirst = true;
    for (const bareSuper of bareSupers) {
      if (isFirst) {
        bareSuper.insertAfter(nodes);
        isFirst = false;
      } else {
        bareSuper.insertAfter(nodes.map(n => _core.types.cloneNode(n)));
      }
    }
  } else {
    constructor.get("body").unshiftContainer("body", nodes);
  }
}
function extractComputedKeys(path, computedPaths, file) {
  const declarations = [];
  const state = {
    classBinding: path.node.id && path.scope.getBinding(path.node.id.name),
    file
  };
  for (const computedPath of computedPaths) {
    const computedKey = computedPath.get("key");
    if (computedKey.isReferencedIdentifier()) {
      handleClassTDZ(computedKey, state);
    } else {
      computedKey.traverse(classFieldDefinitionEvaluationTDZVisitor, state);
    }
    const computedNode = computedPath.node;
    if (!computedKey.isConstantExpression()) {
      const ident = path.scope.generateUidIdentifierBasedOnNode(computedNode.key);
      path.scope.push({
        id: ident,
        kind: "let"
      });
      declarations.push(_core.types.expressionStatement(_core.types.assignmentExpression("=", _core.types.cloneNode(ident), computedNode.key)));
      computedNode.key = _core.types.cloneNode(ident);
    }
  }
  return declarations;
}

//# sourceMappingURL=misc.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841103, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FEATURES = void 0;
exports.enableFeature = enableFeature;
exports.isLoose = isLoose;
exports.shouldTransform = shouldTransform;
var _decorators = require("./decorators");
const FEATURES = Object.freeze({
  fields: 1 << 1,
  privateMethods: 1 << 2,
  decorators: 1 << 3,
  privateIn: 1 << 4,
  staticBlocks: 1 << 5
});
exports.FEATURES = FEATURES;
const featuresSameLoose = new Map([[FEATURES.fields, "@babel/plugin-transform-class-properties"], [FEATURES.privateMethods, "@babel/plugin-transform-private-methods"], [FEATURES.privateIn, "@babel/plugin-transform-private-property-in-object"]]);
const featuresKey = "@babel/plugin-class-features/featuresKey";
const looseKey = "@babel/plugin-class-features/looseKey";
const looseLowPriorityKey = "@babel/plugin-class-features/looseLowPriorityKey/#__internal__@babel/preset-env__please-overwrite-loose-instead-of-throwing";
function enableFeature(file, feature, loose) {
  if (!hasFeature(file, feature) || canIgnoreLoose(file, feature)) {
    file.set(featuresKey, file.get(featuresKey) | feature);
    if (loose === "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error") {
      setLoose(file, feature, true);
      file.set(looseLowPriorityKey, file.get(looseLowPriorityKey) | feature);
    } else if (loose === "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error") {
      setLoose(file, feature, false);
      file.set(looseLowPriorityKey, file.get(looseLowPriorityKey) | feature);
    } else {
      setLoose(file, feature, loose);
    }
  }
  let resolvedLoose;
  let higherPriorityPluginName;
  for (const [mask, name] of featuresSameLoose) {
    if (!hasFeature(file, mask)) continue;
    const loose = isLoose(file, mask);
    if (canIgnoreLoose(file, mask)) {
      continue;
    } else if (resolvedLoose === !loose) {
      throw new Error("'loose' mode configuration must be the same for @babel/plugin-transform-class-properties, " + "@babel/plugin-transform-private-methods and " + "@babel/plugin-transform-private-property-in-object (when they are enabled).");
    } else {
      resolvedLoose = loose;
      higherPriorityPluginName = name;
    }
  }
  if (resolvedLoose !== undefined) {
    for (const [mask, name] of featuresSameLoose) {
      if (hasFeature(file, mask) && isLoose(file, mask) !== resolvedLoose) {
        setLoose(file, mask, resolvedLoose);
        console.warn(`Though the "loose" option was set to "${!resolvedLoose}" in your @babel/preset-env ` + `config, it will not be used for ${name} since the "loose" mode option was set to ` + `"${resolvedLoose}" for ${higherPriorityPluginName}.\nThe "loose" option must be the ` + `same for @babel/plugin-transform-class-properties, @babel/plugin-transform-private-methods ` + `and @babel/plugin-transform-private-property-in-object (when they are enabled): you can ` + `silence this warning by explicitly adding\n` + `\t["${name}", { "loose": ${resolvedLoose} }]\n` + `to the "plugins" section of your Babel config.`);
      }
    }
  }
}
function hasFeature(file, feature) {
  return !!(file.get(featuresKey) & feature);
}
function isLoose(file, feature) {
  return !!(file.get(looseKey) & feature);
}
function setLoose(file, feature, loose) {
  if (loose) file.set(looseKey, file.get(looseKey) | feature);else file.set(looseKey, file.get(looseKey) & ~feature);
  file.set(looseLowPriorityKey, file.get(looseLowPriorityKey) & ~feature);
}
function canIgnoreLoose(file, feature) {
  return !!(file.get(looseLowPriorityKey) & feature);
}
function shouldTransform(path, file) {
  let decoratorPath = null;
  let publicFieldPath = null;
  let privateFieldPath = null;
  let privateMethodPath = null;
  let staticBlockPath = null;
  if ((0, _decorators.hasOwnDecorators)(path.node)) {
    decoratorPath = path.get("decorators.0");
  }
  for (const el of path.get("body.body")) {
    if (!decoratorPath && (0, _decorators.hasOwnDecorators)(el.node)) {
      decoratorPath = el.get("decorators.0");
    }
    if (!publicFieldPath && el.isClassProperty()) {
      publicFieldPath = el;
    }
    if (!privateFieldPath && el.isClassPrivateProperty()) {
      privateFieldPath = el;
    }
    if (!privateMethodPath && el.isClassPrivateMethod != null && el.isClassPrivateMethod()) {
      privateMethodPath = el;
    }
    if (!staticBlockPath && el.isStaticBlock != null && el.isStaticBlock()) {
      staticBlockPath = el;
    }
  }
  if (decoratorPath && privateFieldPath) {
    throw privateFieldPath.buildCodeFrameError("Private fields in decorated classes are not supported yet.");
  }
  if (decoratorPath && privateMethodPath) {
    throw privateMethodPath.buildCodeFrameError("Private methods in decorated classes are not supported yet.");
  }
  if (decoratorPath && !hasFeature(file, FEATURES.decorators)) {
    throw path.buildCodeFrameError("Decorators are not enabled." + "\nIf you are using " + '["@babel/plugin-proposal-decorators", { "version": "legacy" }], ' + 'make sure it comes *before* "@babel/plugin-transform-class-properties" ' + "and enable loose mode, like so:\n" + '\t["@babel/plugin-proposal-decorators", { "version": "legacy" }]\n' + '\t["@babel/plugin-transform-class-properties", { "loose": true }]');
  }
  if (privateMethodPath && !hasFeature(file, FEATURES.privateMethods)) {
    throw privateMethodPath.buildCodeFrameError("Class private methods are not enabled. " + "Please add `@babel/plugin-transform-private-methods` to your configuration.");
  }
  if ((publicFieldPath || privateFieldPath) && !hasFeature(file, FEATURES.fields) && !hasFeature(file, FEATURES.privateMethods)) {
    throw path.buildCodeFrameError("Class fields are not enabled. " + "Please add `@babel/plugin-transform-class-properties` to your configuration.");
  }
  if (staticBlockPath && !hasFeature(file, FEATURES.staticBlocks)) {
    throw path.buildCodeFrameError("Static class blocks are not enabled. " + "Please add `@babel/plugin-transform-class-static-block` to your configuration.");
  }
  if (decoratorPath || privateMethodPath || staticBlockPath) {
    return true;
  }
  if ((publicFieldPath || privateFieldPath) && hasFeature(file, FEATURES.fields)) {
    return true;
  }
  return false;
}

//# sourceMappingURL=features.js.map

}, function(modId) { var map = {"./decorators":1778207841101}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841098);
})()
//miniprogram-npm-outsideDeps=["@babel/core","@babel/helper-function-name","@babel/helper-split-export-declaration","semver","@babel/helper-replace-supers","@babel/helper-environment-visitor","@babel/helper-member-expression-to-functions","@babel/helper-optimise-call-expression","@babel/helper-annotate-as-pure","@babel/helper-skip-transparent-expression-wrappers"]
//# sourceMappingURL=index.js.map