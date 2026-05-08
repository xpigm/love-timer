module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841107, function(require, module, exports) {


exports.__esModule = true;
exports.default = definePolyfillProvider;

var _helperPluginUtils = require("@babel/helper-plugin-utils");

var _helperCompilationTargets = _interopRequireWildcard(require("@babel/helper-compilation-targets"));

var _utils = require("./utils");

var _importsCache = _interopRequireDefault(require("./imports-cache"));

var _debugUtils = require("./debug-utils");

var _normalizeOptions = require("./normalize-options");

var v = _interopRequireWildcard(require("./visitors"));

var deps = _interopRequireWildcard(require("./node/dependencies"));

var _metaResolver = _interopRequireDefault(require("./meta-resolver"));

const _excluded = ["method", "targets", "ignoreBrowserslistConfig", "configPath", "debug", "shouldInjectPolyfill", "absoluteImports"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const getTargets = _helperCompilationTargets.default.default || _helperCompilationTargets.default;

function resolveOptions(options, babelApi) {
  const {
    method,
    targets: targetsOption,
    ignoreBrowserslistConfig,
    configPath,
    debug,
    shouldInjectPolyfill,
    absoluteImports
  } = options,
        providerOptions = _objectWithoutPropertiesLoose(options, _excluded);

  if (isEmpty(options)) {
    throw new Error(`\
This plugin requires options, for example:
    {
      "plugins": [
        ["<plugin name>", { method: "usage-pure" }]
      ]
    }

See more options at https://github.com/babel/babel-polyfills/blob/main/docs/usage.md`);
  }

  let methodName;
  if (method === "usage-global") methodName = "usageGlobal";else if (method === "entry-global") methodName = "entryGlobal";else if (method === "usage-pure") methodName = "usagePure";else if (typeof method !== "string") {
    throw new Error(".method must be a string");
  } else {
    throw new Error(`.method must be one of "entry-global", "usage-global"` + ` or "usage-pure" (received ${JSON.stringify(method)})`);
  }

  if (typeof shouldInjectPolyfill === "function") {
    if (options.include || options.exclude) {
      throw new Error(`.include and .exclude are not supported when using the` + ` .shouldInjectPolyfill function.`);
    }
  } else if (shouldInjectPolyfill != null) {
    throw new Error(`.shouldInjectPolyfill must be a function, or undefined` + ` (received ${JSON.stringify(shouldInjectPolyfill)})`);
  }

  if (absoluteImports != null && typeof absoluteImports !== "boolean" && typeof absoluteImports !== "string") {
    throw new Error(`.absoluteImports must be a boolean, a string, or undefined` + ` (received ${JSON.stringify(absoluteImports)})`);
  }

  let targets;

  if ( // If any browserslist-related option is specified, fallback to the old
  // behavior of not using the targets specified in the top-level options.
  targetsOption || configPath || ignoreBrowserslistConfig) {
    const targetsObj = typeof targetsOption === "string" || Array.isArray(targetsOption) ? {
      browsers: targetsOption
    } : targetsOption;
    targets = getTargets(targetsObj, {
      ignoreBrowserslistConfig,
      configPath
    });
  } else {
    targets = babelApi.targets();
  }

  return {
    method,
    methodName,
    targets,
    absoluteImports: absoluteImports != null ? absoluteImports : false,
    shouldInjectPolyfill,
    debug: !!debug,
    providerOptions: providerOptions
  };
}

function instantiateProvider(factory, options, missingDependencies, dirname, debugLog, babelApi) {
  const {
    method,
    methodName,
    targets,
    debug,
    shouldInjectPolyfill,
    providerOptions,
    absoluteImports
  } = resolveOptions(options, babelApi);
  const getUtils = (0, _utils.createUtilsGetter)(new _importsCache.default(moduleName => deps.resolve(dirname, moduleName, absoluteImports))); // eslint-disable-next-line prefer-const

  let include, exclude;
  let polyfillsSupport;
  let polyfillsNames;
  let filterPolyfills;
  const depsCache = new Map();
  const api = {
    babel: babelApi,
    getUtils,
    method: options.method,
    targets,
    createMetaResolver: _metaResolver.default,

    shouldInjectPolyfill(name) {
      if (polyfillsNames === undefined) {
        throw new Error(`Internal error in the ${factory.name} provider: ` + `shouldInjectPolyfill() can't be called during initialization.`);
      }

      if (!polyfillsNames.has(name)) {
        console.warn(`Internal error in the ${provider.name} provider: ` + `unknown polyfill "${name}".`);
      }

      if (filterPolyfills && !filterPolyfills(name)) return false;
      let shouldInject = (0, _helperCompilationTargets.isRequired)(name, targets, {
        compatData: polyfillsSupport,
        includes: include,
        excludes: exclude
      });

      if (shouldInjectPolyfill) {
        shouldInject = shouldInjectPolyfill(name, shouldInject);

        if (typeof shouldInject !== "boolean") {
          throw new Error(`.shouldInjectPolyfill must return a boolean.`);
        }
      }

      return shouldInject;
    },

    debug(name) {
      var _debugLog, _debugLog$polyfillsSu;

      debugLog().found = true;
      if (!debug || !name) return;
      if (debugLog().polyfills.has(provider.name)) return;
      debugLog().polyfills.add(name);
      (_debugLog$polyfillsSu = (_debugLog = debugLog()).polyfillsSupport) != null ? _debugLog$polyfillsSu : _debugLog.polyfillsSupport = polyfillsSupport;
    },

    assertDependency(name, version = "*") {
      if (missingDependencies === false) return;

      if (absoluteImports) {
        // If absoluteImports is not false, we will try resolving
        // the dependency and throw if it's not possible. We can
        // skip the check here.
        return;
      }

      const dep = version === "*" ? name : `${name}@^${version}`;
      const found = missingDependencies.all ? false : mapGetOr(depsCache, `${name} :: ${dirname}`, () => deps.has(dirname, name));

      if (!found) {
        debugLog().missingDeps.add(dep);
      }
    }

  };
  const provider = factory(api, providerOptions, dirname);

  if (typeof provider[methodName] !== "function") {
    throw new Error(`The "${provider.name || factory.name}" provider doesn't ` + `support the "${method}" polyfilling method.`);
  }

  if (Array.isArray(provider.polyfills)) {
    polyfillsNames = new Set(provider.polyfills);
    filterPolyfills = provider.filterPolyfills;
  } else if (provider.polyfills) {
    polyfillsNames = new Set(Object.keys(provider.polyfills));
    polyfillsSupport = provider.polyfills;
    filterPolyfills = provider.filterPolyfills;
  } else {
    polyfillsNames = new Set();
  }

  ({
    include,
    exclude
  } = (0, _normalizeOptions.validateIncludeExclude)(provider.name || factory.name, polyfillsNames, providerOptions.include || [], providerOptions.exclude || []));
  return {
    debug,
    method,
    targets,
    provider,

    callProvider(payload, path) {
      const utils = getUtils(path);
      provider[methodName](payload, utils, path);
    }

  };
}

function definePolyfillProvider(factory) {
  return (0, _helperPluginUtils.declare)((babelApi, options, dirname) => {
    babelApi.assertVersion(7);
    const {
      traverse
    } = babelApi;
    let debugLog;
    const missingDependencies = (0, _normalizeOptions.applyMissingDependenciesDefaults)(options, babelApi);
    const {
      debug,
      method,
      targets,
      provider,
      callProvider
    } = instantiateProvider(factory, options, missingDependencies, dirname, () => debugLog, babelApi);
    const createVisitor = method === "entry-global" ? v.entry : v.usage;
    const visitor = provider.visitor ? traverse.visitors.merge([createVisitor(callProvider), provider.visitor]) : createVisitor(callProvider);

    if (debug && debug !== _debugUtils.presetEnvSilentDebugHeader) {
      console.log(`${provider.name}: \`DEBUG\` option`);
      console.log(`\nUsing targets: ${(0, _debugUtils.stringifyTargetsMultiline)(targets)}`);
      console.log(`\nUsing polyfills with \`${method}\` method:`);
    }

    return {
      name: "inject-polyfills",
      visitor,

      pre() {
        var _provider$pre;

        debugLog = {
          polyfills: new Set(),
          polyfillsSupport: undefined,
          found: false,
          providers: new Set(),
          missingDeps: new Set()
        };
        (_provider$pre = provider.pre) == null ? void 0 : _provider$pre.apply(this, arguments);
      },

      post() {
        var _provider$post;

        (_provider$post = provider.post) == null ? void 0 : _provider$post.apply(this, arguments);

        if (missingDependencies !== false) {
          if (missingDependencies.log === "per-file") {
            deps.logMissing(debugLog.missingDeps);
          } else {
            deps.laterLogMissing(debugLog.missingDeps);
          }
        }

        if (!debug) return;
        if (this.filename) console.log(`\n[${this.filename}]`);

        if (debugLog.polyfills.size === 0) {
          console.log(method === "entry-global" ? debugLog.found ? `Based on your targets, the ${provider.name} polyfill did not add any polyfill.` : `The entry point for the ${provider.name} polyfill has not been found.` : `Based on your code and targets, the ${provider.name} polyfill did not add any polyfill.`);
          return;
        }

        if (method === "entry-global") {
          console.log(`The ${provider.name} polyfill entry has been replaced with ` + `the following polyfills:`);
        } else {
          console.log(`The ${provider.name} polyfill added the following polyfills:`);
        }

        for (const name of debugLog.polyfills) {
          var _debugLog$polyfillsSu2;

          if ((_debugLog$polyfillsSu2 = debugLog.polyfillsSupport) != null && _debugLog$polyfillsSu2[name]) {
            const filteredTargets = (0, _helperCompilationTargets.getInclusionReasons)(name, targets, debugLog.polyfillsSupport);
            const formattedTargets = JSON.stringify(filteredTargets).replace(/,/g, ", ").replace(/^\{"/, '{ "').replace(/"\}$/, '" }');
            console.log(`  ${name} ${formattedTargets}`);
          } else {
            console.log(`  ${name}`);
          }
        }
      }

    };
  });
}

function mapGetOr(map, key, getDefault) {
  let val = map.get(key);

  if (val === undefined) {
    val = getDefault();
    map.set(key, val);
  }

  return val;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
}, function(modId) {var map = {"./utils":1778207841108,"./imports-cache":1778207841109,"./debug-utils":1778207841110,"./normalize-options":1778207841111,"./visitors":1778207841112,"./node/dependencies":1778207841115,"./meta-resolver":1778207841116}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841108, function(require, module, exports) {


exports.__esModule = true;
exports.createUtilsGetter = createUtilsGetter;
exports.getImportSource = getImportSource;
exports.getRequireSource = getRequireSource;
exports.has = has;
exports.intersection = intersection;
exports.resolveKey = resolveKey;
exports.resolveSource = resolveSource;

var _babel = _interopRequireWildcard(require("@babel/core"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const {
  types: t,
  template: template
} = _babel.default || _babel;

function intersection(a, b) {
  const result = new Set();
  a.forEach(v => b.has(v) && result.add(v));
  return result;
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function getType(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}

function resolveId(path) {
  if (path.isIdentifier() && !path.scope.hasBinding(path.node.name,
  /* noGlobals */
  true)) {
    return path.node.name;
  }

  const {
    deopt
  } = path.evaluate();

  if (deopt && deopt.isIdentifier()) {
    return deopt.node.name;
  }
}

function resolveKey(path, computed = false) {
  const {
    scope
  } = path;
  if (path.isStringLiteral()) return path.node.value;
  const isIdentifier = path.isIdentifier();

  if (isIdentifier && !(computed || path.parent.computed)) {
    return path.node.name;
  }

  if (computed && path.isMemberExpression() && path.get("object").isIdentifier({
    name: "Symbol"
  }) && !scope.hasBinding("Symbol",
  /* noGlobals */
  true)) {
    const sym = resolveKey(path.get("property"), path.node.computed);
    if (sym) return "Symbol." + sym;
  }

  if (!isIdentifier || scope.hasBinding(path.node.name,
  /* noGlobals */
  true)) {
    const {
      value
    } = path.evaluate();
    if (typeof value === "string") return value;
  }
}

function resolveSource(obj) {
  if (obj.isMemberExpression() && obj.get("property").isIdentifier({
    name: "prototype"
  })) {
    const id = resolveId(obj.get("object"));

    if (id) {
      return {
        id,
        placement: "prototype"
      };
    }

    return {
      id: null,
      placement: null
    };
  }

  const id = resolveId(obj);

  if (id) {
    return {
      id,
      placement: "static"
    };
  }

  const {
    value
  } = obj.evaluate();

  if (value !== undefined) {
    return {
      id: getType(value),
      placement: "prototype"
    };
  } else if (obj.isRegExpLiteral()) {
    return {
      id: "RegExp",
      placement: "prototype"
    };
  } else if (obj.isFunction()) {
    return {
      id: "Function",
      placement: "prototype"
    };
  }

  return {
    id: null,
    placement: null
  };
}

function getImportSource({
  node
}) {
  if (node.specifiers.length === 0) return node.source.value;
}

function getRequireSource({
  node
}) {
  if (!t.isExpressionStatement(node)) return;
  const {
    expression
  } = node;

  if (t.isCallExpression(expression) && t.isIdentifier(expression.callee) && expression.callee.name === "require" && expression.arguments.length === 1 && t.isStringLiteral(expression.arguments[0])) {
    return expression.arguments[0].value;
  }
}

function hoist(node) {
  // @ts-expect-error
  node._blockHoist = 3;
  return node;
}

function createUtilsGetter(cache) {
  return path => {
    const prog = path.findParent(p => p.isProgram());
    return {
      injectGlobalImport(url) {
        cache.storeAnonymous(prog, url, (isScript, source) => {
          return isScript ? template.statement.ast`require(${source})` : t.importDeclaration([], source);
        });
      },

      injectNamedImport(url, name, hint = name) {
        return cache.storeNamed(prog, url, name, (isScript, source, name) => {
          const id = prog.scope.generateUidIdentifier(hint);
          return {
            node: isScript ? hoist(template.statement.ast`
                  var ${id} = require(${source}).${name}
                `) : t.importDeclaration([t.importSpecifier(id, name)], source),
            name: id.name
          };
        });
      },

      injectDefaultImport(url, hint = url) {
        return cache.storeNamed(prog, url, "default", (isScript, source) => {
          const id = prog.scope.generateUidIdentifier(hint);
          return {
            node: isScript ? hoist(template.statement.ast`var ${id} = require(${source})`) : t.importDeclaration([t.importDefaultSpecifier(id)], source),
            name: id.name
          };
        });
      }

    };
  };
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841109, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;

var _babel = _interopRequireWildcard(require("@babel/core"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const {
  types: t
} = _babel.default || _babel;

class ImportsCache {
  constructor(resolver) {
    this._imports = new WeakMap();
    this._anonymousImports = new WeakMap();
    this._lastImports = new WeakMap();
    this._resolver = resolver;
  }

  storeAnonymous(programPath, url, // eslint-disable-next-line no-undef
  getVal) {
    const key = this._normalizeKey(programPath, url);

    const imports = this._ensure(this._anonymousImports, programPath, Set);

    if (imports.has(key)) return;
    const node = getVal(programPath.node.sourceType === "script", t.stringLiteral(this._resolver(url)));
    imports.add(key);

    this._injectImport(programPath, node);
  }

  storeNamed(programPath, url, name, getVal) {
    const key = this._normalizeKey(programPath, url, name);

    const imports = this._ensure(this._imports, programPath, Map);

    if (!imports.has(key)) {
      const {
        node,
        name: id
      } = getVal(programPath.node.sourceType === "script", t.stringLiteral(this._resolver(url)), t.identifier(name));
      imports.set(key, id);

      this._injectImport(programPath, node);
    }

    return t.identifier(imports.get(key));
  }

  _injectImport(programPath, node) {
    const lastImport = this._lastImports.get(programPath);

    let newNodes;

    if (lastImport && lastImport.node && // Sometimes the AST is modified and the "last import"
    // we have has been replaced
    lastImport.parent === programPath.node && lastImport.container === programPath.node.body) {
      newNodes = lastImport.insertAfter(node);
    } else {
      newNodes = programPath.unshiftContainer("body", node);
    }

    const newNode = newNodes[newNodes.length - 1];

    this._lastImports.set(programPath, newNode);
    /*
    let lastImport;
     programPath.get("body").forEach(path => {
      if (path.isImportDeclaration()) lastImport = path;
      if (
        path.isExpressionStatement() &&
        isRequireCall(path.get("expression"))
      ) {
        lastImport = path;
      }
      if (
        path.isVariableDeclaration() &&
        path.get("declarations").length === 1 &&
        (isRequireCall(path.get("declarations.0.init")) ||
          (path.get("declarations.0.init").isMemberExpression() &&
            isRequireCall(path.get("declarations.0.init.object"))))
      ) {
        lastImport = path;
      }
    });*/

  }

  _ensure(map, programPath, Collection) {
    let collection = map.get(programPath);

    if (!collection) {
      collection = new Collection();
      map.set(programPath, collection);
    }

    return collection;
  }

  _normalizeKey(programPath, url, name = "") {
    const {
      sourceType
    } = programPath.node; // If we rely on the imported binding (the "name" parameter), we also need to cache
    // based on the sourceType. This is because the module transforms change the names
    // of the import variables.

    return `${name && sourceType}::${url}::${name}`;
  }

}

exports.default = ImportsCache;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841110, function(require, module, exports) {


exports.__esModule = true;
exports.presetEnvSilentDebugHeader = void 0;
exports.stringifyTargets = stringifyTargets;
exports.stringifyTargetsMultiline = stringifyTargetsMultiline;

var _helperCompilationTargets = require("@babel/helper-compilation-targets");

const presetEnvSilentDebugHeader = "#__secret_key__@babel/preset-env__don't_log_debug_header_and_resolved_targets";
exports.presetEnvSilentDebugHeader = presetEnvSilentDebugHeader;

function stringifyTargetsMultiline(targets) {
  return JSON.stringify((0, _helperCompilationTargets.prettifyTargets)(targets), null, 2);
}

function stringifyTargets(targets) {
  return JSON.stringify(targets).replace(/,/g, ", ").replace(/^\{"/, '{ "').replace(/"\}$/, '" }');
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841111, function(require, module, exports) {


exports.__esModule = true;
exports.applyMissingDependenciesDefaults = applyMissingDependenciesDefaults;
exports.validateIncludeExclude = validateIncludeExclude;

var _utils = require("./utils");

function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return pattern;

  try {
    return new RegExp(`^${pattern}$`);
  } catch (_unused) {
    return null;
  }
}

function buildUnusedError(label, unused) {
  if (!unused.length) return "";
  return `  - The following "${label}" patterns didn't match any polyfill:\n` + unused.map(original => `    ${String(original)}\n`).join("");
}

function buldDuplicatesError(duplicates) {
  if (!duplicates.size) return "";
  return `  - The following polyfills were matched both by "include" and "exclude" patterns:\n` + Array.from(duplicates, name => `    ${name}\n`).join("");
}

function validateIncludeExclude(provider, polyfills, includePatterns, excludePatterns) {
  let current;

  const filter = pattern => {
    const regexp = patternToRegExp(pattern);
    if (!regexp) return false;
    let matched = false;

    for (const polyfill of polyfills) {
      if (regexp.test(polyfill)) {
        matched = true;
        current.add(polyfill);
      }
    }

    return !matched;
  }; // prettier-ignore


  const include = current = new Set();
  const unusedInclude = Array.from(includePatterns).filter(filter); // prettier-ignore

  const exclude = current = new Set();
  const unusedExclude = Array.from(excludePatterns).filter(filter);
  const duplicates = (0, _utils.intersection)(include, exclude);

  if (duplicates.size > 0 || unusedInclude.length > 0 || unusedExclude.length > 0) {
    throw new Error(`Error while validating the "${provider}" provider options:\n` + buildUnusedError("include", unusedInclude) + buildUnusedError("exclude", unusedExclude) + buldDuplicatesError(duplicates));
  }

  return {
    include,
    exclude
  };
}

function applyMissingDependenciesDefaults(options, babelApi) {
  const {
    missingDependencies = {}
  } = options;
  if (missingDependencies === false) return false;
  const caller = babelApi.caller(caller => caller == null ? void 0 : caller.name);
  const {
    log = "deferred",
    inject = caller === "rollup-plugin-babel" ? "throw" : "import",
    all = false
  } = missingDependencies;
  return {
    log,
    inject,
    all
  };
}
}, function(modId) { var map = {"./utils":1778207841108}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841112, function(require, module, exports) {


exports.__esModule = true;
exports.usage = exports.entry = void 0;

var _usage = _interopRequireDefault(require("./usage"));

exports.usage = _usage.default;

var _entry = _interopRequireDefault(require("./entry"));

exports.entry = _entry.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
}, function(modId) { var map = {"./usage":1778207841113,"./entry":1778207841114}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841113, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _default = callProvider => {
  function property(object, key, placement, path) {
    return callProvider({
      kind: "property",
      object,
      key,
      placement
    }, path);
  }

  return {
    // Symbol(), new Promise
    ReferencedIdentifier(path) {
      const {
        node: {
          name
        },
        scope
      } = path;
      if (scope.getBindingIdentifier(name)) return;
      callProvider({
        kind: "global",
        name
      }, path);
    },

    MemberExpression(path) {
      const key = (0, _utils.resolveKey)(path.get("property"), path.node.computed);
      if (!key || key === "prototype") return;
      const object = path.get("object");

      if (object.isIdentifier()) {
        const binding = object.scope.getBinding(object.node.name);
        if (binding && binding.path.isImportNamespaceSpecifier()) return;
      }

      const source = (0, _utils.resolveSource)(object);
      return property(source.id, key, source.placement, path);
    },

    ObjectPattern(path) {
      const {
        parentPath,
        parent
      } = path;
      let obj; // const { keys, values } = Object

      if (parentPath.isVariableDeclarator()) {
        obj = parentPath.get("init"); // ({ keys, values } = Object)
      } else if (parentPath.isAssignmentExpression()) {
        obj = parentPath.get("right"); // !function ({ keys, values }) {...} (Object)
        // resolution does not work after properties transform :-(
      } else if (parentPath.isFunction()) {
        const grand = parentPath.parentPath;

        if (grand.isCallExpression() || grand.isNewExpression()) {
          if (grand.node.callee === parent) {
            obj = grand.get("arguments")[path.key];
          }
        }
      }

      let id = null;
      let placement = null;
      if (obj) ({
        id,
        placement
      } = (0, _utils.resolveSource)(obj));

      for (const prop of path.get("properties")) {
        if (prop.isObjectProperty()) {
          const key = (0, _utils.resolveKey)(prop.get("key"));
          if (key) property(id, key, placement, prop);
        }
      }
    },

    BinaryExpression(path) {
      if (path.node.operator !== "in") return;
      const source = (0, _utils.resolveSource)(path.get("right"));
      const key = (0, _utils.resolveKey)(path.get("left"), true);
      if (!key) return;
      callProvider({
        kind: "in",
        object: source.id,
        key,
        placement: source.placement
      }, path);
    }

  };
};

exports.default = _default;
}, function(modId) { var map = {"../utils":1778207841108}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841114, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _default = callProvider => ({
  ImportDeclaration(path) {
    const source = (0, _utils.getImportSource)(path);
    if (!source) return;
    callProvider({
      kind: "import",
      source
    }, path);
  },

  Program(path) {
    path.get("body").forEach(bodyPath => {
      const source = (0, _utils.getRequireSource)(bodyPath);
      if (!source) return;
      callProvider({
        kind: "import",
        source
      }, bodyPath);
    });
  }

});

exports.default = _default;
}, function(modId) { var map = {"../utils":1778207841108}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841115, function(require, module, exports) {


exports.__esModule = true;
exports.has = has;
exports.laterLogMissing = laterLogMissing;
exports.logMissing = logMissing;
exports.resolve = resolve;

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _resolve = _interopRequireDefault(require("resolve"));

var _module = require("module");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const nativeRequireResolve = parseFloat(process.versions.node) >= 8.9;

// eslint-disable-line
function myResolve(name, basedir) {
  if (nativeRequireResolve) {
    return require.resolve(name, {
      paths: [basedir]
    }).replace(/\\/g, "/");
  } else {
    return _resolve.default.sync(name, {
      basedir
    }).replace(/\\/g, "/");
  }
}

function resolve(dirname, moduleName, absoluteImports) {
  if (absoluteImports === false) return moduleName;
  let basedir = dirname;

  if (typeof absoluteImports === "string") {
    basedir = _path.default.resolve(basedir, absoluteImports);
  }

  try {
    return myResolve(moduleName, basedir);
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;
    throw Object.assign(new Error(`Failed to resolve "${moduleName}" relative to "${dirname}"`), {
      code: "BABEL_POLYFILL_NOT_FOUND",
      polyfill: moduleName,
      dirname
    });
  }
}

function has(basedir, name) {
  try {
    myResolve(name, basedir);
    return true;
  } catch (_unused) {
    return false;
  }
}

function logMissing(missingDeps) {
  if (missingDeps.size === 0) return;
  const deps = Array.from(missingDeps).sort().join(" ");
  console.warn("\nSome polyfills have been added but are not present in your dependencies.\n" + "Please run one of the following commands:\n" + `\tnpm install --save ${deps}\n` + `\tyarn add ${deps}\n`);
  process.exitCode = 1;
}

let allMissingDeps = new Set();
const laterLogMissingDependencies = (0, _lodash.default)(() => {
  logMissing(allMissingDeps);
  allMissingDeps = new Set();
}, 100);

function laterLogMissing(missingDeps) {
  if (missingDeps.size === 0) return;
  missingDeps.forEach(name => allMissingDeps.add(name));
  laterLogMissingDependencies();
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841116, function(require, module, exports) {


exports.__esModule = true;
exports.default = createMetaResolver;

var _utils = require("./utils");

const PossibleGlobalObjects = new Set(["global", "globalThis", "self", "window"]);

function createMetaResolver(polyfills) {
  const {
    static: staticP,
    instance: instanceP,
    global: globalP
  } = polyfills;
  return meta => {
    if (meta.kind === "global" && globalP && (0, _utils.has)(globalP, meta.name)) {
      return {
        kind: "global",
        desc: globalP[meta.name],
        name: meta.name
      };
    }

    if (meta.kind === "property" || meta.kind === "in") {
      const {
        placement,
        object,
        key
      } = meta;

      if (object && placement === "static") {
        if (globalP && PossibleGlobalObjects.has(object) && (0, _utils.has)(globalP, key)) {
          return {
            kind: "global",
            desc: globalP[key],
            name: key
          };
        }

        if (staticP && (0, _utils.has)(staticP, object) && (0, _utils.has)(staticP[object], key)) {
          return {
            kind: "static",
            desc: staticP[object][key],
            name: `${object}$${key}`
          };
        }
      }

      if (instanceP && (0, _utils.has)(instanceP, key)) {
        return {
          kind: "instance",
          desc: instanceP[key],
          name: `${key}`
        };
      }
    }
  };
}
}, function(modId) { var map = {"./utils":1778207841108}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841107);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/helper-compilation-targets","@babel/core","path","lodash.debounce","resolve","module"]
//# sourceMappingURL=index.js.map