module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207841532, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");

var _pluginSyntaxPipelineOperator = require("@babel/plugin-syntax-pipeline-operator");

var _minimalVisitor = require("./minimalVisitor");

var _hackVisitor = require("./hackVisitor");

var _fsharpVisitor = require("./fsharpVisitor");

var _smartVisitor = require("./smartVisitor");

const visitorsPerProposal = {
  minimal: _minimalVisitor.default,
  hack: _hackVisitor.default,
  fsharp: _fsharpVisitor.default,
  smart: _smartVisitor.default
};

var _default = (0, _helperPluginUtils.declare)((api, options) => {
  api.assertVersion(7);
  const {
    proposal
  } = options;

  if (proposal === "smart") {
    console.warn(`The smart-mix pipe operator is deprecated. Use "proposal": "hack" instead.`);
  }

  return {
    name: "proposal-pipeline-operator",
    inherits: _pluginSyntaxPipelineOperator.default,
    visitor: visitorsPerProposal[options.proposal]
  };
});

exports.default = _default;
}, function(modId) {var map = {"./minimalVisitor":1778207841533,"./hackVisitor":1778207841535,"./fsharpVisitor":1778207841536,"./smartVisitor":1778207841537}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841533, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

var _buildOptimizedSequenceExpression = require("./buildOptimizedSequenceExpression");

const minimalVisitor = {
  BinaryExpression(path) {
    const {
      scope,
      node
    } = path;
    const {
      operator,
      left,
      right
    } = node;
    if (operator !== "|>") return;
    const placeholder = scope.generateUidIdentifierBasedOnNode(left);

    const call = _core.types.callExpression(right, [_core.types.cloneNode(placeholder)]);

    path.replaceWith((0, _buildOptimizedSequenceExpression.default)({
      placeholder,
      call,
      path: path
    }));
  }

};
var _default = minimalVisitor;
exports.default = _default;
}, function(modId) { var map = {"./buildOptimizedSequenceExpression":1778207841534}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841534, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

function isConciseArrowExpression(node) {
  return _core.types.isArrowFunctionExpression(node) && _core.types.isExpression(node.body) && !node.async;
}

const buildOptimizedSequenceExpression = ({
  call,
  path,
  placeholder
}) => {
  const {
    callee: calledExpression
  } = call;
  const pipelineLeft = path.node.left;

  const assign = _core.types.assignmentExpression("=", _core.types.cloneNode(placeholder), pipelineLeft);

  const expressionIsArrow = isConciseArrowExpression(calledExpression);

  if (expressionIsArrow) {
    let param;
    let optimizeArrow = true;
    const {
      params
    } = calledExpression;

    if (params.length === 1 && _core.types.isIdentifier(params[0])) {
      param = params[0];
    } else if (params.length > 0) {
      optimizeArrow = false;
    }

    if (optimizeArrow && !param) {
      return _core.types.sequenceExpression([pipelineLeft, calledExpression.body]);
    } else if (param) {
      path.scope.push({
        id: _core.types.cloneNode(placeholder)
      });
      path.get("right").scope.rename(param.name, placeholder.name);
      return _core.types.sequenceExpression([assign, calledExpression.body]);
    }
  } else if (_core.types.isIdentifier(calledExpression, {
    name: "eval"
  })) {
    const evalSequence = _core.types.sequenceExpression([_core.types.numericLiteral(0), calledExpression]);

    call.callee = evalSequence;
  }

  path.scope.push({
    id: _core.types.cloneNode(placeholder)
  });
  return _core.types.sequenceExpression([assign, call]);
};

var _default = buildOptimizedSequenceExpression;
exports.default = _default;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841535, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

const topicReferenceVisitor = {
  exit(path, state) {
    if (path.isTopicReference()) {
      state.topicReferences.push(path);
    } else {
      if (state.topicReferences.length === 0 && !state.sideEffectsBeforeFirstTopicReference && !path.isPure()) {
        state.sideEffectsBeforeFirstTopicReference = true;
      }
    }
  },

  "ClassBody|Function"(_, state) {
    if (state.topicReferences.length === 0) {
      state.sideEffectsBeforeFirstTopicReference = true;
    }
  }

};
const visitor = {
  BinaryExpression: {
    exit(path) {
      const {
        scope,
        node
      } = path;

      if (node.operator !== "|>") {
        return;
      }

      const pipeBodyPath = path.get("right");

      if (pipeBodyPath.node.type === "TopicReference") {
        path.replaceWith(node.left);
        return;
      }

      const visitorState = {
        topicReferences: [],
        sideEffectsBeforeFirstTopicReference: pipeBodyPath.isFunction()
      };
      pipeBodyPath.traverse(topicReferenceVisitor, visitorState);

      if (visitorState.topicReferences.length === 1 && (!visitorState.sideEffectsBeforeFirstTopicReference || path.scope.isPure(node.left, true))) {
        visitorState.topicReferences[0].replaceWith(node.left);
        path.replaceWith(node.right);
        return;
      }

      const topicVariable = scope.generateUidIdentifierBasedOnNode(node);
      scope.push({
        id: topicVariable
      });
      visitorState.topicReferences.forEach(path => path.replaceWith(_core.types.cloneNode(topicVariable)));
      path.replaceWith(_core.types.sequenceExpression([_core.types.assignmentExpression("=", _core.types.cloneNode(topicVariable), node.left), node.right]));
    }

  }
};
var _default = visitor;
exports.default = _default;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841536, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

var _buildOptimizedSequenceExpression = require("./buildOptimizedSequenceExpression");

const fsharpVisitor = {
  BinaryExpression(path) {
    const {
      scope,
      node
    } = path;
    const {
      operator,
      left,
      right
    } = node;
    if (operator !== "|>") return;
    const placeholder = scope.generateUidIdentifierBasedOnNode(left);
    const call = right.type === "AwaitExpression" ? _core.types.awaitExpression(_core.types.cloneNode(placeholder)) : _core.types.callExpression(right, [_core.types.cloneNode(placeholder)]);
    const sequence = (0, _buildOptimizedSequenceExpression.default)({
      placeholder,
      call,
      path: path
    });
    path.replaceWith(sequence);
  }

};
var _default = fsharpVisitor;
exports.default = _default;
}, function(modId) { var map = {"./buildOptimizedSequenceExpression":1778207841534}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1778207841537, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

const updateTopicReferenceVisitor = {
  PipelinePrimaryTopicReference(path) {
    path.replaceWith(_core.types.cloneNode(this.topicId));
  },

  PipelineTopicExpression(path) {
    path.skip();
  }

};
const smartVisitor = {
  BinaryExpression(path) {
    const {
      scope
    } = path;
    const {
      node
    } = path;
    const {
      operator,
      left,
      right
    } = node;
    if (operator !== "|>") return;
    const placeholder = scope.generateUidIdentifierBasedOnNode(left);
    scope.push({
      id: placeholder
    });
    let call;

    if (_core.types.isPipelineTopicExpression(right)) {
      path.get("right").traverse(updateTopicReferenceVisitor, {
        topicId: placeholder
      });
      call = right.expression;
    } else {
      let callee = right.callee;

      if (_core.types.isIdentifier(callee, {
        name: "eval"
      })) {
        callee = _core.types.sequenceExpression([_core.types.numericLiteral(0), callee]);
      }

      call = _core.types.callExpression(callee, [_core.types.cloneNode(placeholder)]);
    }

    path.replaceWith(_core.types.sequenceExpression([_core.types.assignmentExpression("=", _core.types.cloneNode(placeholder), left), call]));
  }

};
var _default = smartVisitor;
exports.default = _default;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207841532);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/plugin-syntax-pipeline-operator","@babel/core"]
//# sourceMappingURL=index.js.map