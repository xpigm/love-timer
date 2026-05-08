module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1778207842076, function(require, module, exports) {
let assert = require('assert').strict;

let handlerCompany = function(type, ...args) {
    if (typeof this.handlers['on' + type] === 'function') {
        this.handlers['on' + type](...args);
    }
};

class WXMLParser {
    constructor(handlers) {
        this.handlers = handlers || {};
    }

    write(source) {
        this.inputs = source;
        this.len = source.length || 0;
        this.pos = 0;
        this.parseNodes();
    }

    getNextChar() {
        return this.inputs[this.pos];
    }

    getNextString(len) {
        return this.inputs.substr(this.pos, len)
    }

    startWiths(str) {
        return this.inputs.substr(this.pos, str.length) === str;
    }

    isEOF() {
        return this.pos >= this.len;
    }

    // consume

    consumeChar() {
        return this.inputs[this.pos++];
    }

    consumeCharIgnoreWhitespace() {
        const text = this.consumeWhitespace()
        // if (text) {
        //     handlerCompany.call(this, 'text', text);
        // }
        return this.inputs[this.pos++];
    }

    consumeWhile(matchFunc, len) {
        let result = '';

        while (!this.isEOF() && matchFunc(len ? this.getNextString(len) : this.getNextChar())) {
            result += this.consumeChar();
        }
        return result;
    }

    consumeWhitespace() {
        return this.consumeWhile((char) => /\s/.test(char));
    }

    // parse
    parseNodes() {
        while (!this.isEOF() && !this.startWiths('</')) {
            this.parseNode();
        }
    }

    parseNode() {
        let nextChar = this.getNextChar();
        switch (nextChar) {
            case '{':
                this.parseTemplate();
                break;
            case '<':
                if (this.startWiths('<!--')) {
                    this.parseComment();
                    return;
                }
                // open tag
                this.parseElement();
                break;
            default:
                this.parseText();
        }
    }

    parseTemplate() {
        assert.ok(this.consumeChar() === '{');
        assert.ok(this.consumeChar() === '{');
        let template = this.consumeWhile((char) => char !== '}');
        handlerCompany.call(this, 'template', template);
        assert.ok(this.consumeChar() === '}');
        assert.ok(this.consumeChar() === '}');
    }

    parseText() {
        let text = this.consumeWhile((char) => /[^<{]/.test(char));
        handlerCompany.call(this, 'text', text);
        return text;
    }

    parseComment() {
        assert.ok(this.consumeChar() === '<');
        assert.ok(this.consumeChar() === '!');
        assert.ok(this.consumeChar() === '-');
        assert.ok(this.consumeChar() === '-');
        let comment = this.consumeWhile((char) => char !== '-' || !this.startWiths('-->'));
        handlerCompany.call(this, 'comment', comment);
        assert.ok(this.consumeChar() === '-');
        assert.ok(this.consumeChar() === '-');
        assert.ok(this.consumeChar() === '>');
        return comment;
    }

    parseElement() {
        // open tag
        assert.ok(this.consumeChar() === '<');
        let tagName = this.parseTagName();
        let attrs = this.parseAttrs();
        let isSelfClosing = false;

        this.consumeWhitespace();
        if (this.getNextChar() === '/') {
            // selfClosing
            isSelfClosing = true;
        }
        handlerCompany.call(this, 'opentag', tagName, attrs, isSelfClosing);
        this.consumeWhile((char) => char !== '>');
        assert.ok(this.consumeChar() === '>');
        if (isSelfClosing) {
            // handlerCompany.call(this, 'closetag', tagName, true);
            return;
        }

        if (tagName === 'wxs') {
            const wxs = this.consumeWhile(str => str !== '</wxs', 5);
            handlerCompany.call(this, 'wxs', wxs);
        } else {
            this.parseNodes();
        }

        assert.ok(this.consumeCharIgnoreWhitespace() === '<');
        assert.ok(this.consumeCharIgnoreWhitespace() === '/');
        let closeTagName = this.parseTagName();
        handlerCompany.call(this, 'closetag', closeTagName, false);
        assert.ok(this.consumeCharIgnoreWhitespace() === '>');
    }

    parseTagName() {
        return this.consumeWhile((char) => /[\w-]/.test(char));
    }

    parseAttrs() {
        this.consumeWhitespace();
        let attrs = {};
        while (/[^/>]/.test(this.getNextChar())) {
            let key = this.consumeWhile((char) => /[^=/>\s]/.test(char));
            this.consumeWhitespace();
            if (this.getNextChar() !== '=') {
                attrs[key] = '';
                continue;
            }
            assert.ok(this.consumeChar() === '=');
            this.consumeWhitespace();
            let quoteMark = this.consumeChar(); // single or double quote marks
            assert.ok(/['"]/.test(quoteMark));
            let val = this.consumeWhile((char) => char !== quoteMark);
            assert.ok(this.consumeChar() === quoteMark);
            attrs[key] = val;
            this.consumeWhitespace();
        }
        return attrs;
    }
}

module.exports = WXMLParser;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1778207842076);
})()
//miniprogram-npm-outsideDeps=["assert"]
//# sourceMappingURL=index.js.map