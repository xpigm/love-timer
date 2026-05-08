module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841868, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPolyfillPlugins = exports.getModulesPluginNames = exports.default = void 0;
exports.isPluginRequired = isPluginRequired;
exports.transformIncludesAndExcludes = void 0;
var _semver = require("semver");
var _debug = require("./debug");
var _getOptionSpecificExcludes = require("./get-option-specific-excludes");
var _filterItems = require("./filter-items");
var _moduleTransformations = require("./module-transformations");
var _normalizeOptions = require("./normalize-options");
var _shippedProposals = require("./shipped-proposals");
var _pluginsCompatData = require("./plugins-compat-data");
var _regenerator = require("./polyfills/regenerator");
var _babelPolyfill = require("./polyfills/babel-polyfill");
var _babelPluginPolyfillCorejs = require("babel-plugin-polyfill-corejs2");
var _babelPluginPolyfillCorejs2 = require("babel-plugin-polyfill-corejs3");
var _babelPluginPolyfillRegenerator = require("babel-plugin-polyfill-regenerator");
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
var _availablePlugins = require("./available-plugins");
var _helperPluginUtils = require("@babel/helper-plugin-utils");
const pluginCoreJS2 = _babelPluginPolyfillCorejs.default || _babelPluginPolyfillCorejs;
const pluginCoreJS3 = _babelPluginPolyfillCorejs2.default || _babelPluginPolyfillCorejs2;
const pluginRegenerator = _babelPluginPolyfillRegenerator.default || _babelPluginPolyfillRegenerator;
function isPluginRequired(targets, support) {
  return (0, _helperCompilationTargets.isRequired)("fake-name", targets, {
    compatData: {
      "fake-name": support
    }
  });
}
function filterStageFromList(list, stageList) {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) {
      result[item] = list[item];
    }
    return result;
  }, {});
}
const pluginLists = {
  withProposals: {
    withoutBugfixes: _pluginsCompatData.plugins,
    withBugfixes: Object.assign({}, _pluginsCompatData.plugins, _pluginsCompatData.pluginsBugfixes)
  },
  withoutProposals: {
    withoutBugfixes: filterStageFromList(_pluginsCompatData.plugins, _shippedProposals.proposalPlugins),
    withBugfixes: filterStageFromList(Object.assign({}, _pluginsCompatData.plugins, _pluginsCompatData.pluginsBugfixes), _shippedProposals.proposalPlugins)
  }
};
function getPluginList(proposals, bugfixes) {
  if (proposals) {
    if (bugfixes) return pluginLists.withProposals.withBugfixes;else return pluginLists.withProposals.withoutBugfixes;
  } else {
    if (bugfixes) return pluginLists.withoutProposals.withBugfixes;else return pluginLists.withoutProposals.withoutBugfixes;
  }
}
const getPlugin = pluginName => {
  const plugin = _availablePlugins.default[pluginName]();
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};
const transformIncludesAndExcludes = opts => {
  return opts.reduce((result, opt) => {
    const target = opt.match(/^(es|es6|es7|esnext|web)\./) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};
exports.transformIncludesAndExcludes = transformIncludesAndExcludes;
const getModulesPluginNames = ({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom,
  shouldParseTopLevelAwait
}) => {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }
    if (shouldTransformDynamicImport && shouldTransformESM && modules !== "umd") {
      modulesPluginNames.push("transform-dynamic-import");
    } else {
      if (shouldTransformDynamicImport) {
        console.warn("Dynamic import can only be supported when transforming ES modules" + " to AMD, CommonJS or SystemJS. Only the parser plugin will be enabled.");
      }
      modulesPluginNames.push("syntax-dynamic-import");
    }
  } else {
    modulesPluginNames.push("syntax-dynamic-import");
  }
  if (shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("transform-export-namespace-from");
  } else {
    modulesPluginNames.push("syntax-export-namespace-from");
  }
  if (shouldParseTopLevelAwait) {
    modulesPluginNames.push("syntax-top-level-await");
  }
  return modulesPluginNames;
};
exports.getModulesPluginNames = getModulesPluginNames;
const getPolyfillPlugins = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug
}) => {
  const polyfillPlugins = [];
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = {
      method: `${useBuiltIns}-global`,
      version: corejs ? corejs.toString() : undefined,
      targets: polyfillTargets,
      include,
      exclude,
      proposals,
      shippedProposals,
      debug
    };
    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push([pluginCoreJS2, pluginOptions], [_babelPolyfill.default, {
            usage: true
          }]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [_babelPolyfill.default, {
            usage: true,
            deprecated: true
          }]);
        }
        if (regenerator) {
          polyfillPlugins.push([pluginRegenerator, {
            method: "usage-global",
            debug
          }]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push([_babelPolyfill.default, {
            regenerator
          }], [pluginCoreJS2, pluginOptions]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [_babelPolyfill.default, {
            deprecated: true
          }]);
          if (!regenerator) {
            polyfillPlugins.push([_regenerator.default, pluginOptions]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
};
exports.getPolyfillPlugins = getPolyfillPlugins;
function getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv) {
  if (optionsTargets != null && optionsTargets.esmodules && optionsTargets.browsers) {
    console.warn(`
@babel/preset-env: esmodules and browsers targets have been specified together.
\`browsers\` target, \`${optionsTargets.browsers.toString()}\` will be ignored.
`);
  }
  return (0, _helperCompilationTargets.default)(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv
  });
}
function supportsStaticESM(caller) {
  return !!(caller != null && caller.supportsStaticESM);
}
function supportsDynamicImport(caller) {
  return !!(caller != null && caller.supportsDynamicImport);
}
function supportsExportNamespaceFrom(caller) {
  return !!(caller != null && caller.supportsExportNamespaceFrom);
}
function supportsTopLevelAwait(caller) {
  return !!(caller != null && caller.supportsTopLevelAwait);
}
var _default = (0, _helperPluginUtils.declarePreset)((api, opts) => {
  api.assertVersion(7);
  const babelTargets = api.targets();
  const {
    bugfixes,
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    loose,
    modules,
    shippedProposals,
    spec,
    targets: optionsTargets,
    useBuiltIns,
    corejs: {
      version: corejs,
      proposals
    },
    browserslistEnv
  } = (0, _normalizeOptions.default)(opts);
  let targets = babelTargets;
  if (_semver.lt(api.version, "7.13.0") || opts.targets || opts.configPath || opts.browserslistEnv || opts.ignoreBrowserslistConfig) {
    {
      var hasUglifyTarget = false;
      if (optionsTargets != null && optionsTargets.uglify) {
        hasUglifyTarget = true;
        delete optionsTargets.uglify;
        console.warn(`
The uglify target has been deprecated. Set the top level
option \`forceAllTransforms: true\` instead.
`);
      }
    }
    targets = getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv);
  }
  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const compatData = getPluginList(shippedProposals, bugfixes);
  const shouldSkipExportNamespaceFrom = modules === "auto" && (api.caller == null ? void 0 : api.caller(supportsExportNamespaceFrom)) || modules === false && !(0, _helperCompilationTargets.isRequired)("transform-export-namespace-from", transformTargets, {
    compatData,
    includes: include.plugins,
    excludes: exclude.plugins
  });
  const modulesPluginNames = getModulesPluginNames({
    modules,
    transformations: _moduleTransformations.default,
    shouldTransformESM: modules !== "auto" || !(api.caller != null && api.caller(supportsStaticESM)),
    shouldTransformDynamicImport: modules !== "auto" || !(api.caller != null && api.caller(supportsDynamicImport)),
    shouldTransformExportNamespaceFrom: !shouldSkipExportNamespaceFrom,
    shouldParseTopLevelAwait: !api.caller || api.caller(supportsTopLevelAwait)
  });
  const pluginNames = (0, _helperCompilationTargets.filterItems)(compatData, include.plugins, exclude.plugins, transformTargets, modulesPluginNames, (0, _getOptionSpecificExcludes.default)({
    loose
  }), _shippedProposals.pluginSyntaxMap);
  (0, _filterItems.removeUnnecessaryItems)(pluginNames, _pluginsCompatData.overlappingPlugins);
  (0, _filterItems.removeUnsupportedItems)(pluginNames, api.version);
  if (shippedProposals) {
    (0, _filterItems.addProposalSyntaxPlugins)(pluginNames, _shippedProposals.proposalSyntaxPlugins);
  }
  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns,
    corejs,
    polyfillTargets: targets,
    include: include.builtIns,
    exclude: exclude.builtIns,
    proposals,
    shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"),
    debug
  });
  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map(pluginName => {
    if (pluginName === "transform-class-properties" || pluginName === "transform-private-methods" || pluginName === "transform-private-property-in-object") {
      return [getPlugin(pluginName), {
        loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
    }
    return [getPlugin(pluginName), {
      spec,
      loose,
      useBuiltIns: pluginUseBuiltIns
    }];
  }).concat(polyfillPlugins);
  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify((0, _helperCompilationTargets.prettifyTargets)(targets), null, 2));
    console.log(`\nUsing modules transform: ${modules.toString()}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      (0, _debug.logPlugin)(pluginName, targets, compatData);
    });
    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    }
  }
  return {
    plugins
  };
});
exports.default = _default;

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./debug":1778207841869,"./get-option-specific-excludes":1778207841870,"./filter-items":1778207841871,"./module-transformations":1778207841873,"./normalize-options":1778207841874,"./shipped-proposals":1778207841878,"./plugins-compat-data":1778207841876,"./polyfills/regenerator":1778207841879,"./polyfills/babel-polyfill":1778207841881,"./available-plugins":1778207841872}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841869, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logPlugin = void 0;
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
var _plugins = require("@babel/compat-data/plugins");
const logPlugin = (item, targetVersions, list) => {
  const filteredList = (0, _helperCompilationTargets.getInclusionReasons)(item, targetVersions, list);
  const support = list[item];
  if (item.startsWith("transform-")) {
    const proposalName = `proposal-${item.slice(10)}`;
    if (proposalName === "proposal-dynamic-import" || Object.prototype.hasOwnProperty.call(_plugins, proposalName)) {
      item = proposalName;
    }
  }
  if (!support) {
    console.log(`  ${item}`);
    return;
  }
  let formattedTargets = `{`;
  let first = true;
  for (const target of Object.keys(filteredList)) {
    if (!first) formattedTargets += `,`;
    first = false;
    formattedTargets += ` ${target}`;
    if (support[target]) formattedTargets += ` < ${support[target]}`;
  }
  formattedTargets += ` }`;
  console.log(`  ${item} ${formattedTargets}`);
};
exports.logPlugin = logPlugin;

//# sourceMappingURL=debug.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841870, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
const defaultExcludesForLooseMode = ["transform-typeof-symbol"];
function _default({
  loose
}) {
  return loose ? defaultExcludesForLooseMode : null;
}

//# sourceMappingURL=get-option-specific-excludes.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841871, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addProposalSyntaxPlugins = addProposalSyntaxPlugins;
exports.removeUnnecessaryItems = removeUnnecessaryItems;
exports.removeUnsupportedItems = removeUnsupportedItems;
var _semver = require("semver");
var _availablePlugins = require("./available-plugins");
const has = Function.call.bind(Object.hasOwnProperty);
function addProposalSyntaxPlugins(items, proposalSyntaxPlugins) {
  proposalSyntaxPlugins.forEach(plugin => {
    items.add(plugin);
  });
}
function removeUnnecessaryItems(items, overlapping) {
  items.forEach(item => {
    var _overlapping$item;
    (_overlapping$item = overlapping[item]) == null ? void 0 : _overlapping$item.forEach(name => items.delete(name));
  });
}
function removeUnsupportedItems(items, babelVersion) {
  items.forEach(item => {
    if (has(_availablePlugins.minVersions, item) && _semver.lt(babelVersion, _availablePlugins.minVersions[item])) {
      items.delete(item);
    }
  });
}

//# sourceMappingURL=filter-items.js.map

}, function(modId) { var map = {"./available-plugins":1778207841872}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841872, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.minVersions = exports.default = void 0;
var _pluginSyntaxAsyncGenerators = require("@babel/plugin-syntax-async-generators");
var _pluginSyntaxClassProperties = require("@babel/plugin-syntax-class-properties");
var _pluginSyntaxClassStaticBlock = require("@babel/plugin-syntax-class-static-block");
var _pluginSyntaxDynamicImport = require("@babel/plugin-syntax-dynamic-import");
var _pluginSyntaxExportNamespaceFrom = require("@babel/plugin-syntax-export-namespace-from");
var _pluginSyntaxImportAssertions = require("@babel/plugin-syntax-import-assertions");
var _pluginSyntaxJsonStrings = require("@babel/plugin-syntax-json-strings");
var _pluginSyntaxLogicalAssignmentOperators = require("@babel/plugin-syntax-logical-assignment-operators");
var _pluginSyntaxNullishCoalescingOperator = require("@babel/plugin-syntax-nullish-coalescing-operator");
var _pluginSyntaxNumericSeparator = require("@babel/plugin-syntax-numeric-separator");
var _pluginSyntaxObjectRestSpread = require("@babel/plugin-syntax-object-rest-spread");
var _pluginSyntaxOptionalCatchBinding = require("@babel/plugin-syntax-optional-catch-binding");
var _pluginSyntaxOptionalChaining = require("@babel/plugin-syntax-optional-chaining");
var _pluginSyntaxPrivatePropertyInObject = require("@babel/plugin-syntax-private-property-in-object");
var _pluginSyntaxTopLevelAwait = require("@babel/plugin-syntax-top-level-await");
var _pluginProposalAsyncGeneratorFunctions = require("@babel/plugin-proposal-async-generator-functions");
var _pluginProposalClassProperties = require("@babel/plugin-proposal-class-properties");
var _pluginProposalClassStaticBlock = require("@babel/plugin-proposal-class-static-block");
var _pluginProposalDynamicImport = require("@babel/plugin-proposal-dynamic-import");
var _pluginProposalExportNamespaceFrom = require("@babel/plugin-proposal-export-namespace-from");
var _pluginProposalJsonStrings = require("@babel/plugin-proposal-json-strings");
var _pluginProposalLogicalAssignmentOperators = require("@babel/plugin-proposal-logical-assignment-operators");
var _pluginProposalNullishCoalescingOperator = require("@babel/plugin-proposal-nullish-coalescing-operator");
var _pluginProposalNumericSeparator = require("@babel/plugin-proposal-numeric-separator");
var _pluginProposalObjectRestSpread = require("@babel/plugin-proposal-object-rest-spread");
var _pluginProposalOptionalCatchBinding = require("@babel/plugin-proposal-optional-catch-binding");
var _pluginProposalOptionalChaining = require("@babel/plugin-proposal-optional-chaining");
var _pluginProposalPrivateMethods = require("@babel/plugin-proposal-private-methods");
var _pluginProposalPrivatePropertyInObject = require("@babel/plugin-proposal-private-property-in-object");
var _pluginProposalUnicodePropertyRegex = require("@babel/plugin-proposal-unicode-property-regex");
var _pluginTransformAsyncToGenerator = require("@babel/plugin-transform-async-to-generator");
var _pluginTransformArrowFunctions = require("@babel/plugin-transform-arrow-functions");
var _pluginTransformBlockScopedFunctions = require("@babel/plugin-transform-block-scoped-functions");
var _pluginTransformBlockScoping = require("@babel/plugin-transform-block-scoping");
var _pluginTransformClasses = require("@babel/plugin-transform-classes");
var _pluginTransformComputedProperties = require("@babel/plugin-transform-computed-properties");
var _pluginTransformDestructuring = require("@babel/plugin-transform-destructuring");
var _pluginTransformDotallRegex = require("@babel/plugin-transform-dotall-regex");
var _pluginTransformDuplicateKeys = require("@babel/plugin-transform-duplicate-keys");
var _pluginTransformExponentiationOperator = require("@babel/plugin-transform-exponentiation-operator");
var _pluginTransformForOf = require("@babel/plugin-transform-for-of");
var _pluginTransformFunctionName = require("@babel/plugin-transform-function-name");
var _pluginTransformLiterals = require("@babel/plugin-transform-literals");
var _pluginTransformMemberExpressionLiterals = require("@babel/plugin-transform-member-expression-literals");
var _pluginTransformModulesAmd = require("@babel/plugin-transform-modules-amd");
var _pluginTransformModulesCommonjs = require("@babel/plugin-transform-modules-commonjs");
var _pluginTransformModulesSystemjs = require("@babel/plugin-transform-modules-systemjs");
var _pluginTransformModulesUmd = require("@babel/plugin-transform-modules-umd");
var _pluginTransformNamedCapturingGroupsRegex = require("@babel/plugin-transform-named-capturing-groups-regex");
var _pluginTransformNewTarget = require("@babel/plugin-transform-new-target");
var _pluginTransformObjectSuper = require("@babel/plugin-transform-object-super");
var _pluginTransformParameters = require("@babel/plugin-transform-parameters");
var _pluginTransformPropertyLiterals = require("@babel/plugin-transform-property-literals");
var _pluginTransformRegenerator = require("@babel/plugin-transform-regenerator");
var _pluginTransformReservedWords = require("@babel/plugin-transform-reserved-words");
var _pluginTransformShorthandProperties = require("@babel/plugin-transform-shorthand-properties");
var _pluginTransformSpread = require("@babel/plugin-transform-spread");
var _pluginTransformStickyRegex = require("@babel/plugin-transform-sticky-regex");
var _pluginTransformTemplateLiterals = require("@babel/plugin-transform-template-literals");
var _pluginTransformTypeofSymbol = require("@babel/plugin-transform-typeof-symbol");
var _pluginTransformUnicodeEscapes = require("@babel/plugin-transform-unicode-escapes");
var _pluginTransformUnicodeRegex = require("@babel/plugin-transform-unicode-regex");
var _transformAsyncArrowsInClass = require("@babel/preset-modules/lib/plugins/transform-async-arrows-in-class");
var _transformEdgeDefaultParameters = require("@babel/preset-modules/lib/plugins/transform-edge-default-parameters");
var _transformEdgeFunctionName = require("@babel/preset-modules/lib/plugins/transform-edge-function-name");
var _transformTaggedTemplateCaching = require("@babel/preset-modules/lib/plugins/transform-tagged-template-caching");
var _transformSafariBlockShadowing = require("@babel/preset-modules/lib/plugins/transform-safari-block-shadowing");
var _transformSafariForShadowing = require("@babel/preset-modules/lib/plugins/transform-safari-for-shadowing");
var _pluginBugfixSafariIdDestructuringCollisionInFunctionExpression = require("@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression");
var _pluginBugfixV8SpreadParametersInOptionalChaining = require("@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining");
var _default = {
  "bugfix/transform-async-arrows-in-class": () => _transformAsyncArrowsInClass,
  "bugfix/transform-edge-default-parameters": () => _transformEdgeDefaultParameters,
  "bugfix/transform-edge-function-name": () => _transformEdgeFunctionName,
  "bugfix/transform-safari-block-shadowing": () => _transformSafariBlockShadowing,
  "bugfix/transform-safari-for-shadowing": () => _transformSafariForShadowing,
  "bugfix/transform-safari-id-destructuring-collision-in-function-expression": () => _pluginBugfixSafariIdDestructuringCollisionInFunctionExpression.default,
  "bugfix/transform-tagged-template-caching": () => _transformTaggedTemplateCaching,
  "bugfix/transform-v8-spread-parameters-in-optional-chaining": () => _pluginBugfixV8SpreadParametersInOptionalChaining.default,
  "syntax-async-generators": () => _pluginSyntaxAsyncGenerators,
  "syntax-class-properties": () => _pluginSyntaxClassProperties,
  "syntax-class-static-block": () => _pluginSyntaxClassStaticBlock,
  "syntax-dynamic-import": () => _pluginSyntaxDynamicImport,
  "syntax-export-namespace-from": () => _pluginSyntaxExportNamespaceFrom,
  "syntax-import-assertions": () => _pluginSyntaxImportAssertions.default,
  "syntax-json-strings": () => _pluginSyntaxJsonStrings,
  "syntax-logical-assignment-operators": () => _pluginSyntaxLogicalAssignmentOperators,
  "syntax-nullish-coalescing-operator": () => _pluginSyntaxNullishCoalescingOperator,
  "syntax-numeric-separator": () => _pluginSyntaxNumericSeparator,
  "syntax-object-rest-spread": () => _pluginSyntaxObjectRestSpread,
  "syntax-optional-catch-binding": () => _pluginSyntaxOptionalCatchBinding,
  "syntax-optional-chaining": () => _pluginSyntaxOptionalChaining,
  "syntax-private-property-in-object": () => _pluginSyntaxPrivatePropertyInObject,
  "syntax-top-level-await": () => _pluginSyntaxTopLevelAwait,
  "transform-arrow-functions": () => _pluginTransformArrowFunctions.default,
  "transform-async-generator-functions": () => _pluginProposalAsyncGeneratorFunctions.default,
  "transform-async-to-generator": () => _pluginTransformAsyncToGenerator.default,
  "transform-block-scoped-functions": () => _pluginTransformBlockScopedFunctions.default,
  "transform-block-scoping": () => _pluginTransformBlockScoping.default,
  "transform-class-properties": () => _pluginProposalClassProperties.default,
  "transform-class-static-block": () => _pluginProposalClassStaticBlock.default,
  "transform-classes": () => _pluginTransformClasses.default,
  "transform-computed-properties": () => _pluginTransformComputedProperties.default,
  "transform-destructuring": () => _pluginTransformDestructuring.default,
  "transform-dotall-regex": () => _pluginTransformDotallRegex.default,
  "transform-duplicate-keys": () => _pluginTransformDuplicateKeys.default,
  "transform-dynamic-import": () => _pluginProposalDynamicImport.default,
  "transform-exponentiation-operator": () => _pluginTransformExponentiationOperator.default,
  "transform-export-namespace-from": () => _pluginProposalExportNamespaceFrom.default,
  "transform-for-of": () => _pluginTransformForOf.default,
  "transform-function-name": () => _pluginTransformFunctionName.default,
  "transform-json-strings": () => _pluginProposalJsonStrings.default,
  "transform-literals": () => _pluginTransformLiterals.default,
  "transform-logical-assignment-operators": () => _pluginProposalLogicalAssignmentOperators.default,
  "transform-member-expression-literals": () => _pluginTransformMemberExpressionLiterals.default,
  "transform-modules-amd": () => _pluginTransformModulesAmd.default,
  "transform-modules-commonjs": () => _pluginTransformModulesCommonjs.default,
  "transform-modules-systemjs": () => _pluginTransformModulesSystemjs.default,
  "transform-modules-umd": () => _pluginTransformModulesUmd.default,
  "transform-named-capturing-groups-regex": () => _pluginTransformNamedCapturingGroupsRegex.default,
  "transform-new-target": () => _pluginTransformNewTarget.default,
  "transform-nullish-coalescing-operator": () => _pluginProposalNullishCoalescingOperator.default,
  "transform-numeric-separator": () => _pluginProposalNumericSeparator.default,
  "transform-object-rest-spread": () => _pluginProposalObjectRestSpread.default,
  "transform-object-super": () => _pluginTransformObjectSuper.default,
  "transform-optional-catch-binding": () => _pluginProposalOptionalCatchBinding.default,
  "transform-optional-chaining": () => _pluginProposalOptionalChaining.default,
  "transform-parameters": () => _pluginTransformParameters.default,
  "transform-private-methods": () => _pluginProposalPrivateMethods.default,
  "transform-private-property-in-object": () => _pluginProposalPrivatePropertyInObject.default,
  "transform-property-literals": () => _pluginTransformPropertyLiterals.default,
  "transform-regenerator": () => _pluginTransformRegenerator.default,
  "transform-reserved-words": () => _pluginTransformReservedWords.default,
  "transform-shorthand-properties": () => _pluginTransformShorthandProperties.default,
  "transform-spread": () => _pluginTransformSpread.default,
  "transform-sticky-regex": () => _pluginTransformStickyRegex.default,
  "transform-template-literals": () => _pluginTransformTemplateLiterals.default,
  "transform-typeof-symbol": () => _pluginTransformTypeofSymbol.default,
  "transform-unicode-escapes": () => _pluginTransformUnicodeEscapes.default,
  "transform-unicode-property-regex": () => _pluginProposalUnicodePropertyRegex.default,
  "transform-unicode-regex": () => _pluginTransformUnicodeRegex.default
};
exports.default = _default;
const minVersions = {
  "bugfix/transform-safari-id-destructuring-collision-in-function-expression": "7.16.0",
  "transform-class-static-block": "7.12.0",
  "transform-private-property-in-object": "7.10.0"
};
exports.minVersions = minVersions;

//# sourceMappingURL=available-plugins.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841873, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  auto: "transform-modules-commonjs",
  amd: "transform-modules-amd",
  commonjs: "transform-modules-commonjs",
  cjs: "transform-modules-commonjs",
  systemjs: "transform-modules-systemjs",
  umd: "transform-modules-umd"
};
exports.default = _default;

//# sourceMappingURL=module-transformations.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841874, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkDuplicateIncludeExcludes = void 0;
exports.default = normalizeOptions;
exports.normalizeCoreJSOption = normalizeCoreJSOption;
exports.validateUseBuiltInsOption = exports.validateModulesOption = exports.normalizePluginName = void 0;
var _semver = require("semver");
var _corejs2BuiltIns = require("@babel/compat-data/corejs2-built-ins");
var _coreJsCompat = require("../data/core-js-compat");
var _pluginsCompatData = require("./plugins-compat-data");
var _moduleTransformations = require("./module-transformations");
var _options = require("./options");
var _helperValidatorOption = require("@babel/helper-validator-option");
const corejs2DefaultWebIncludes = ["web.timers", "web.immediate", "web.dom.iterable"];
const v = new _helperValidatorOption.OptionValidator("@babel/preset-env");
const allPluginsList = Object.keys(_pluginsCompatData.plugins);
const modulePlugins = ["transform-dynamic-import", ...Object.keys(_moduleTransformations.default).map(m => _moduleTransformations.default[m])];
const getValidIncludesAndExcludes = (type, corejs) => Array.from(new Set([...allPluginsList, ...(type === "exclude" ? modulePlugins : []), ...(corejs ? corejs == 2 ? [...Object.keys(_corejs2BuiltIns), ...corejs2DefaultWebIncludes] : Object.keys(_coreJsCompat) : [])]));
function flatMap(array, fn) {
  return Array.prototype.concat.apply([], array.map(fn));
}
const normalizePluginName = plugin => plugin.replace(/^(@babel\/|babel-)(plugin-)?/, "");
exports.normalizePluginName = normalizePluginName;
const expandIncludesAndExcludes = (filterList = [], type, corejs) => {
  if (filterList.length === 0) return [];
  const filterableItems = getValidIncludesAndExcludes(type, corejs);
  const invalidFilters = [];
  const selectedPlugins = flatMap(filterList, filter => {
    let re;
    if (typeof filter === "string") {
      try {
        re = new RegExp(`^${normalizePluginName(filter)}$`);
      } catch (e) {
        invalidFilters.push(filter);
        return [];
      }
    } else {
      re = filter;
    }
    const items = filterableItems.filter(item => re.test(item) || re.test(item.replace(/^transform-/, "proposal-")));
    if (items.length === 0) invalidFilters.push(filter);
    return items;
  });
  v.invariant(invalidFilters.length === 0, `The plugins/built-ins '${invalidFilters.join(", ")}' passed to the '${type}' option are not
    valid. Please check data/[plugin-features|built-in-features].js in babel-preset-env`);
  return selectedPlugins;
};
const checkDuplicateIncludeExcludes = (include = [], exclude = []) => {
  const duplicates = include.filter(opt => exclude.indexOf(opt) >= 0);
  v.invariant(duplicates.length === 0, `The plugins/built-ins '${duplicates.join(", ")}' were found in both the "include" and
    "exclude" options.`);
};
exports.checkDuplicateIncludeExcludes = checkDuplicateIncludeExcludes;
const normalizeTargets = targets => {
  if (typeof targets === "string" || Array.isArray(targets)) {
    return {
      browsers: targets
    };
  }
  return Object.assign({}, targets);
};
const validateModulesOption = (modulesOpt = _options.ModulesOption.auto) => {
  v.invariant(_options.ModulesOption[modulesOpt.toString()] || modulesOpt === _options.ModulesOption.false, `The 'modules' option must be one of \n` + ` - 'false' to indicate no module processing\n` + ` - a specific module type: 'commonjs', 'amd', 'umd', 'systemjs'` + ` - 'auto' (default) which will automatically select 'false' if the current\n` + `   process is known to support ES module syntax, or "commonjs" otherwise\n`);
  return modulesOpt;
};
exports.validateModulesOption = validateModulesOption;
const validateUseBuiltInsOption = (builtInsOpt = false) => {
  v.invariant(_options.UseBuiltInsOption[builtInsOpt.toString()] || builtInsOpt === _options.UseBuiltInsOption.false, `The 'useBuiltIns' option must be either
    'false' (default) to indicate no polyfill,
    '"entry"' to indicate replacing the entry polyfill, or
    '"usage"' to import only used polyfills per file`);
  return builtInsOpt;
};
exports.validateUseBuiltInsOption = validateUseBuiltInsOption;
function normalizeCoreJSOption(corejs, useBuiltIns) {
  let proposals = false;
  let rawVersion;
  if (useBuiltIns && corejs === undefined) {
    rawVersion = 2;
    console.warn("\nWARNING (@babel/preset-env): We noticed you're using the `useBuiltIns` option without declaring a " + "core-js version. Currently, we assume version 2.x when no version " + "is passed. Since this default version will likely change in future " + "versions of Babel, we recommend explicitly setting the core-js version " + "you are using via the `corejs` option.\n" + "\nYou should also be sure that the version you pass to the `corejs` " + "option matches the version specified in your `package.json`'s " + "`dependencies` section. If it doesn't, you need to run one of the " + "following commands:\n\n" + "  npm install --save core-js@2    npm install --save core-js@3\n" + "  yarn add core-js@2              yarn add core-js@3\n\n" + "More info about useBuiltIns: https://babeljs.io/docs/en/babel-preset-env#usebuiltins\n" + "More info about core-js: https://babeljs.io/docs/en/babel-preset-env#corejs");
  } else if (typeof corejs === "object" && corejs !== null) {
    rawVersion = corejs.version;
    proposals = Boolean(corejs.proposals);
  } else {
    rawVersion = corejs;
  }
  const version = rawVersion ? _semver.coerce(String(rawVersion)) : false;
  if (!useBuiltIns && version) {
    console.warn("\nWARNING (@babel/preset-env): The `corejs` option only has an effect when the `useBuiltIns` option is not `false`\n");
  }
  if (useBuiltIns && (!version || version.major < 2 || version.major > 3)) {
    throw new RangeError("Invalid Option: The version passed to `corejs` is invalid. Currently, " + "only core-js@2 and core-js@3 are supported.");
  }
  return {
    version,
    proposals
  };
}
function normalizeOptions(opts) {
  v.validateTopLevelOptions(opts, _options.TopLevelOptions);
  const useBuiltIns = validateUseBuiltInsOption(opts.useBuiltIns);
  const corejs = normalizeCoreJSOption(opts.corejs, useBuiltIns);
  const include = expandIncludesAndExcludes(opts.include, _options.TopLevelOptions.include, !!corejs.version && corejs.version.major);
  const exclude = expandIncludesAndExcludes(opts.exclude, _options.TopLevelOptions.exclude, !!corejs.version && corejs.version.major);
  checkDuplicateIncludeExcludes(include, exclude);
  return {
    bugfixes: v.validateBooleanOption(_options.TopLevelOptions.bugfixes, opts.bugfixes, false),
    configPath: v.validateStringOption(_options.TopLevelOptions.configPath, opts.configPath, process.cwd()),
    corejs,
    debug: v.validateBooleanOption(_options.TopLevelOptions.debug, opts.debug, false),
    include,
    exclude,
    forceAllTransforms: v.validateBooleanOption(_options.TopLevelOptions.forceAllTransforms, opts.forceAllTransforms, false),
    ignoreBrowserslistConfig: v.validateBooleanOption(_options.TopLevelOptions.ignoreBrowserslistConfig, opts.ignoreBrowserslistConfig, false),
    loose: v.validateBooleanOption(_options.TopLevelOptions.loose, opts.loose),
    modules: validateModulesOption(opts.modules),
    shippedProposals: v.validateBooleanOption(_options.TopLevelOptions.shippedProposals, opts.shippedProposals, false),
    spec: v.validateBooleanOption(_options.TopLevelOptions.spec, opts.spec, false),
    targets: normalizeTargets(opts.targets),
    useBuiltIns: useBuiltIns,
    browserslistEnv: v.validateStringOption(_options.TopLevelOptions.browserslistEnv, opts.browserslistEnv)
  };
}

//# sourceMappingURL=normalize-options.js.map

}, function(modId) { var map = {"../data/core-js-compat":1778207841875,"./plugins-compat-data":1778207841876,"./module-transformations":1778207841873,"./options":1778207841877}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841875, function(require, module, exports) {
module.exports = require("core-js-compat/data.json");

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841876, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pluginsBugfixes = exports.plugins = exports.overlappingPlugins = void 0;
var _plugins = require("@babel/compat-data/plugins");
var _pluginBugfixes = require("@babel/compat-data/plugin-bugfixes");
var _overlappingPlugins = require("@babel/compat-data/overlapping-plugins");
var _availablePlugins = require("./available-plugins");
const keys = Object.keys;
const plugins = filterAvailable(_plugins);
exports.plugins = plugins;
const pluginsBugfixes = filterAvailable(_pluginBugfixes);
exports.pluginsBugfixes = pluginsBugfixes;
const overlappingPlugins = filterAvailable(_overlappingPlugins);
exports.overlappingPlugins = overlappingPlugins;
function filterAvailable(data) {
  const result = {};
  for (const plugin of keys(data)) {
    if (Object.hasOwnProperty.call(_availablePlugins.default, plugin)) {
      result[plugin] = data[plugin];
    }
  }
  return result;
}

//# sourceMappingURL=plugins-compat-data.js.map

}, function(modId) { var map = {"./available-plugins":1778207841872}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841877, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UseBuiltInsOption = exports.TopLevelOptions = exports.ModulesOption = void 0;
const TopLevelOptions = {
  bugfixes: "bugfixes",
  configPath: "configPath",
  corejs: "corejs",
  debug: "debug",
  exclude: "exclude",
  forceAllTransforms: "forceAllTransforms",
  ignoreBrowserslistConfig: "ignoreBrowserslistConfig",
  include: "include",
  loose: "loose",
  modules: "modules",
  shippedProposals: "shippedProposals",
  spec: "spec",
  targets: "targets",
  useBuiltIns: "useBuiltIns",
  browserslistEnv: "browserslistEnv"
};
exports.TopLevelOptions = TopLevelOptions;
const ModulesOption = {
  false: false,
  auto: "auto",
  amd: "amd",
  commonjs: "commonjs",
  cjs: "cjs",
  systemjs: "systemjs",
  umd: "umd"
};
exports.ModulesOption = ModulesOption;
const UseBuiltInsOption = {
  false: false,
  entry: "entry",
  usage: "usage"
};
exports.UseBuiltInsOption = UseBuiltInsOption;

//# sourceMappingURL=options.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841878, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proposalSyntaxPlugins = exports.proposalPlugins = exports.pluginSyntaxMap = void 0;
const proposalPlugins = new Set();
exports.proposalPlugins = proposalPlugins;
const proposalSyntaxPlugins = ["syntax-import-assertions"];
exports.proposalSyntaxPlugins = proposalSyntaxPlugins;
const pluginSyntaxObject = {
  "transform-async-generator-functions": "syntax-async-generators",
  "transform-class-properties": "syntax-class-properties",
  "transform-class-static-block": "syntax-class-static-block",
  "transform-json-strings": "syntax-json-strings",
  "transform-nullish-coalescing-operator": "syntax-nullish-coalescing-operator",
  "transform-numeric-separator": "syntax-numeric-separator",
  "transform-object-rest-spread": "syntax-object-rest-spread",
  "transform-optional-catch-binding": "syntax-optional-catch-binding",
  "transform-optional-chaining": "syntax-optional-chaining",
  "transform-private-methods": "syntax-class-properties",
  "transform-private-property-in-object": "syntax-private-property-in-object",
  "transform-unicode-property-regex": null
};
const pluginSyntaxEntries = Object.keys(pluginSyntaxObject).map(function (key) {
  return [key, pluginSyntaxObject[key]];
});
const pluginSyntaxMap = new Map(pluginSyntaxEntries);
exports.pluginSyntaxMap = pluginSyntaxMap;

//# sourceMappingURL=shipped-proposals.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841879, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _utils = require("./utils");
function isRegeneratorSource(source) {
  return source === "regenerator-runtime/runtime" || source === "regenerator-runtime/runtime.js";
}
function _default() {
  const visitor = {
    ImportDeclaration(path) {
      if (isRegeneratorSource((0, _utils.getImportSource)(path))) {
        this.regeneratorImportExcluded = true;
        path.remove();
      }
    },
    Program(path) {
      path.get("body").forEach(bodyPath => {
        if (isRegeneratorSource((0, _utils.getRequireSource)(bodyPath))) {
          this.regeneratorImportExcluded = true;
          bodyPath.remove();
        }
      });
    }
  };
  return {
    name: "preset-env/remove-regenerator",
    visitor,
    pre() {
      this.regeneratorImportExcluded = false;
    },
    post() {
      if (this.opts.debug && this.regeneratorImportExcluded) {
        let filename = this.file.opts.filename;
        if (process.env.BABEL_ENV === "test") {
          filename = filename.replace(/\\/g, "/");
        }
        console.log(`\n[${filename}] Based on your targets, regenerator-runtime import excluded.`);
      }
    }
  };
}

//# sourceMappingURL=regenerator.js.map

}, function(modId) { var map = {"./utils":1778207841880}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841880, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getImportSource = getImportSource;
exports.getRequireSource = getRequireSource;
exports.isPolyfillSource = isPolyfillSource;
var _t = require("@babel/types");
const {
  isCallExpression,
  isExpressionStatement,
  isIdentifier,
  isStringLiteral
} = _t;
function getImportSource({
  node
}) {
  if (node.specifiers.length === 0) return node.source.value;
}
function getRequireSource({
  node
}) {
  if (!isExpressionStatement(node)) return;
  const {
    expression
  } = node;
  if (isCallExpression(expression) && isIdentifier(expression.callee) && expression.callee.name === "require" && expression.arguments.length === 1 && isStringLiteral(expression.arguments[0])) {
    return expression.arguments[0].value;
  }
}
function isPolyfillSource(source) {
  return source === "@babel/polyfill" || source === "core-js";
}

//# sourceMappingURL=utils.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841881, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _utils = require("./utils");
const BABEL_POLYFILL_DEPRECATION = `
  \`@babel/polyfill\` is deprecated. Please, use required parts of \`core-js\`
  and \`regenerator-runtime/runtime\` separately`;
const NO_DIRECT_POLYFILL_IMPORT = `
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the direct import of \`SPECIFIER\` or use \`useBuiltIns: 'entry'\` instead.`;
function _default({
  template
}, {
  regenerator,
  deprecated,
  usage
}) {
  return {
    name: "preset-env/replace-babel-polyfill",
    visitor: {
      ImportDeclaration(path) {
        const src = (0, _utils.getImportSource)(path);
        if (usage && (0, _utils.isPolyfillSource)(src)) {
          console.warn(NO_DIRECT_POLYFILL_IMPORT.replace("SPECIFIER", src));
          if (!deprecated) path.remove();
        } else if (src === "@babel/polyfill") {
          if (deprecated) {
            console.warn(BABEL_POLYFILL_DEPRECATION);
          } else if (regenerator) {
            path.replaceWithMultiple(template.ast`
              import "core-js";
              import "regenerator-runtime/runtime.js";
            `);
          } else {
            path.replaceWith(template.ast`
              import "core-js";
            `);
          }
        }
      },
      Program(path) {
        path.get("body").forEach(bodyPath => {
          const src = (0, _utils.getRequireSource)(bodyPath);
          if (usage && (0, _utils.isPolyfillSource)(src)) {
            console.warn(NO_DIRECT_POLYFILL_IMPORT.replace("SPECIFIER", src));
            if (!deprecated) bodyPath.remove();
          } else if (src === "@babel/polyfill") {
            if (deprecated) {
              console.warn(BABEL_POLYFILL_DEPRECATION);
            } else if (regenerator) {
              bodyPath.replaceWithMultiple(template.ast`
                require("core-js");
                require("regenerator-runtime/runtime.js");
              `);
            } else {
              bodyPath.replaceWith(template.ast`
                require("core-js");
              `);
            }
          }
        });
      }
    }
  };
}

//# sourceMappingURL=babel-polyfill.js.map

}, function(modId) { var map = {"./utils":1778207841880}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841868);
})()
//miniprogram-npm-outsideDeps=["semver","babel-plugin-polyfill-corejs2","babel-plugin-polyfill-corejs3","babel-plugin-polyfill-regenerator","@babel/helper-compilation-targets","@babel/helper-plugin-utils","@babel/compat-data/plugins","@babel/plugin-syntax-async-generators","@babel/plugin-syntax-class-properties","@babel/plugin-syntax-class-static-block","@babel/plugin-syntax-dynamic-import","@babel/plugin-syntax-export-namespace-from","@babel/plugin-syntax-import-assertions","@babel/plugin-syntax-json-strings","@babel/plugin-syntax-logical-assignment-operators","@babel/plugin-syntax-nullish-coalescing-operator","@babel/plugin-syntax-numeric-separator","@babel/plugin-syntax-object-rest-spread","@babel/plugin-syntax-optional-catch-binding","@babel/plugin-syntax-optional-chaining","@babel/plugin-syntax-private-property-in-object","@babel/plugin-syntax-top-level-await","@babel/plugin-proposal-async-generator-functions","@babel/plugin-proposal-class-properties","@babel/plugin-proposal-class-static-block","@babel/plugin-proposal-dynamic-import","@babel/plugin-proposal-export-namespace-from","@babel/plugin-proposal-json-strings","@babel/plugin-proposal-logical-assignment-operators","@babel/plugin-proposal-nullish-coalescing-operator","@babel/plugin-proposal-numeric-separator","@babel/plugin-proposal-object-rest-spread","@babel/plugin-proposal-optional-catch-binding","@babel/plugin-proposal-optional-chaining","@babel/plugin-proposal-private-methods","@babel/plugin-proposal-private-property-in-object","@babel/plugin-proposal-unicode-property-regex","@babel/plugin-transform-async-to-generator","@babel/plugin-transform-arrow-functions","@babel/plugin-transform-block-scoped-functions","@babel/plugin-transform-block-scoping","@babel/plugin-transform-classes","@babel/plugin-transform-computed-properties","@babel/plugin-transform-destructuring","@babel/plugin-transform-dotall-regex","@babel/plugin-transform-duplicate-keys","@babel/plugin-transform-exponentiation-operator","@babel/plugin-transform-for-of","@babel/plugin-transform-function-name","@babel/plugin-transform-literals","@babel/plugin-transform-member-expression-literals","@babel/plugin-transform-modules-amd","@babel/plugin-transform-modules-commonjs","@babel/plugin-transform-modules-systemjs","@babel/plugin-transform-modules-umd","@babel/plugin-transform-named-capturing-groups-regex","@babel/plugin-transform-new-target","@babel/plugin-transform-object-super","@babel/plugin-transform-parameters","@babel/plugin-transform-property-literals","@babel/plugin-transform-regenerator","@babel/plugin-transform-reserved-words","@babel/plugin-transform-shorthand-properties","@babel/plugin-transform-spread","@babel/plugin-transform-sticky-regex","@babel/plugin-transform-template-literals","@babel/plugin-transform-typeof-symbol","@babel/plugin-transform-unicode-escapes","@babel/plugin-transform-unicode-regex","@babel/preset-modules/lib/plugins/transform-async-arrows-in-class","@babel/preset-modules/lib/plugins/transform-edge-default-parameters","@babel/preset-modules/lib/plugins/transform-edge-function-name","@babel/preset-modules/lib/plugins/transform-tagged-template-caching","@babel/preset-modules/lib/plugins/transform-safari-block-shadowing","@babel/preset-modules/lib/plugins/transform-safari-for-shadowing","@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression","@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining","@babel/compat-data/corejs2-built-ins","@babel/helper-validator-option","core-js-compat/data.json","@babel/compat-data/plugin-bugfixes","@babel/compat-data/overlapping-plugins","@babel/types"]
//# sourceMappingURL=index.js.map