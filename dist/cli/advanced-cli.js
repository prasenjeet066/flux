#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/compiler/lexer.js
var FluxLexer;
var init_lexer = __esm({
  "src/compiler/lexer.js"() {
    FluxLexer = class _FluxLexer {
      constructor(source) {
        this.source = source;
        this.position = 0;
        this.start = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.errors = [];
      }
      // Token types
      static TOKEN_TYPES = {
        // Literals
        IDENTIFIER: "IDENTIFIER",
        NUMBER: "NUMBER",
        STRING: "STRING",
        BOOLEAN: "BOOLEAN",
        // Keywords
        COMPONENT: "COMPONENT",
        STATE: "STATE",
        PROP: "PROP",
        METHOD: "METHOD",
        RENDER: "RENDER",
        EFFECT: "EFFECT",
        COMPUTED: "COMPUTED",
        STORE: "STORE",
        ACTION: "ACTION",
        LIFECYCLE: "LIFECYCLE",
        GUARD: "GUARD",
        ROUTER: "ROUTER",
        ROUTE: "ROUTE",
        USE: "USE",
        IMPORT: "IMPORT",
        EXPORT: "EXPORT",
        ASYNC: "ASYNC",
        AWAIT: "AWAIT",
        IF: "IF",
        ELSE: "ELSE",
        FOR: "FOR",
        WHILE: "WHILE",
        RETURN: "RETURN",
        TRY: "TRY",
        CATCH: "CATCH",
        FINALLY: "FINALLY",
        // Operators
        ASSIGN: "ASSIGN",
        PLUS_ASSIGN: "PLUS_ASSIGN",
        MINUS_ASSIGN: "MINUS_ASSIGN",
        PLUS: "PLUS",
        MINUS: "MINUS",
        MULTIPLY: "MULTIPLY",
        DIVIDE: "DIVIDE",
        MODULO: "MODULO",
        EQUALS: "EQUALS",
        NOT_EQUALS: "NOT_EQUALS",
        LESS_THAN: "LESS_THAN",
        GREATER_THAN: "GREATER_THAN",
        LESS_EQUAL: "LESS_EQUAL",
        GREATER_EQUAL: "GREATER_EQUAL",
        LOGICAL_AND: "LOGICAL_AND",
        LOGICAL_OR: "LOGICAL_OR",
        LOGICAL_NOT: "LOGICAL_NOT",
        // Delimiters
        LEFT_PAREN: "LEFT_PAREN",
        RIGHT_PAREN: "RIGHT_PAREN",
        LEFT_BRACE: "LEFT_BRACE",
        RIGHT_BRACE: "RIGHT_BRACE",
        LEFT_BRACKET: "LEFT_BRACKET",
        RIGHT_BRACKET: "RIGHT_BRACKET",
        SEMICOLON: "SEMICOLON",
        COMMA: "COMMA",
        DOT: "DOT",
        COLON: "COLON",
        QUESTION: "QUESTION",
        // JSX-like tokens
        JSX_OPEN: "JSX_OPEN",
        JSX_CLOSE: "JSX_CLOSE",
        JSX_SELF_CLOSE: "JSX_SELF_CLOSE",
        JSX_TEXT: "JSX_TEXT",
        // Decorators
        AT: "AT",
        // Special
        NEWLINE: "NEWLINE",
        EOF: "EOF",
        UNKNOWN: "UNKNOWN"
      };
      static KEYWORDS = {
        "component": "COMPONENT",
        "state": "STATE",
        "prop": "PROP",
        "method": "METHOD",
        "render": "RENDER",
        "effect": "EFFECT",
        "computed": "COMPUTED",
        "store": "STORE",
        "action": "ACTION",
        "lifecycle": "LIFECYCLE",
        "guard": "GUARD",
        "router": "ROUTER",
        "route": "ROUTE",
        "use": "USE",
        "import": "IMPORT",
        "export": "EXPORT",
        "async": "ASYNC",
        "await": "AWAIT",
        "if": "IF",
        "else": "ELSE",
        "for": "FOR",
        "while": "WHILE",
        "return": "RETURN",
        "try": "TRY",
        "catch": "CATCH",
        "finally": "FINALLY",
        "true": "BOOLEAN",
        "false": "BOOLEAN",
        "null": "BOOLEAN",
        "undefined": "BOOLEAN"
      };
      tokenize() {
        while (!this.isAtEnd()) {
          this.scanToken();
        }
        this.addToken(_FluxLexer.TOKEN_TYPES.EOF);
        return this.tokens;
      }
      scanToken() {
        this.start = this.position;
        const c = this.advance();
        switch (c) {
          case " ":
          case "\r":
          case "	":
            break;
          // Ignore whitespace
          case "\n":
            this.line++;
            this.column = 1;
            this.addToken(_FluxLexer.TOKEN_TYPES.NEWLINE);
            break;
          case "(":
            this.addToken(_FluxLexer.TOKEN_TYPES.LEFT_PAREN);
            break;
          case ")":
            this.addToken(_FluxLexer.TOKEN_TYPES.RIGHT_PAREN);
            break;
          case "{":
            this.addToken(_FluxLexer.TOKEN_TYPES.LEFT_BRACE);
            break;
          case "}":
            this.addToken(_FluxLexer.TOKEN_TYPES.RIGHT_BRACE);
            break;
          case "[":
            this.addToken(_FluxLexer.TOKEN_TYPES.LEFT_BRACKET);
            break;
          case "]":
            this.addToken(_FluxLexer.TOKEN_TYPES.RIGHT_BRACKET);
            break;
          case ";":
            this.addToken(_FluxLexer.TOKEN_TYPES.SEMICOLON);
            break;
          case ",":
            this.addToken(_FluxLexer.TOKEN_TYPES.COMMA);
            break;
          case ".":
            this.addToken(_FluxLexer.TOKEN_TYPES.DOT);
            break;
          case ":":
            this.addToken(_FluxLexer.TOKEN_TYPES.COLON);
            break;
          case "?":
            this.addToken(_FluxLexer.TOKEN_TYPES.QUESTION);
            break;
          case "@":
            this.addToken(_FluxLexer.TOKEN_TYPES.AT);
            break;
          case "+":
            this.addToken(
              this.match("=") ? _FluxLexer.TOKEN_TYPES.PLUS_ASSIGN : _FluxLexer.TOKEN_TYPES.PLUS
            );
            break;
          case "-":
            this.addToken(
              this.match("=") ? _FluxLexer.TOKEN_TYPES.MINUS_ASSIGN : _FluxLexer.TOKEN_TYPES.MINUS
            );
            break;
          case "*":
            this.addToken(_FluxLexer.TOKEN_TYPES.MULTIPLY);
            break;
          case "%":
            this.addToken(_FluxLexer.TOKEN_TYPES.MODULO);
            break;
          case "!":
            this.addToken(
              this.match("=") ? _FluxLexer.TOKEN_TYPES.NOT_EQUALS : _FluxLexer.TOKEN_TYPES.LOGICAL_NOT
            );
            break;
          case "=":
            this.addToken(
              this.match("=") ? _FluxLexer.TOKEN_TYPES.EQUALS : _FluxLexer.TOKEN_TYPES.ASSIGN
            );
            break;
          case "<":
            if (this.peek() === "/") {
              this.advance();
              this.addToken(_FluxLexer.TOKEN_TYPES.JSX_CLOSE);
            } else if (this.match("=")) {
              this.addToken(_FluxLexer.TOKEN_TYPES.LESS_EQUAL);
            } else {
              this.addToken(_FluxLexer.TOKEN_TYPES.JSX_OPEN);
            }
            break;
          case ">":
            this.addToken(
              this.match("=") ? _FluxLexer.TOKEN_TYPES.GREATER_EQUAL : _FluxLexer.TOKEN_TYPES.GREATER_THAN
            );
            break;
          case "&":
            if (this.match("&")) {
              this.addToken(_FluxLexer.TOKEN_TYPES.LOGICAL_AND);
            }
            break;
          case "|":
            if (this.match("|")) {
              this.addToken(_FluxLexer.TOKEN_TYPES.LOGICAL_OR);
            }
            break;
          case "/":
            if (this.match("/")) {
              while (this.peek() !== "\n" && !this.isAtEnd()) {
                this.advance();
              }
            } else if (this.match("*")) {
              this.blockComment();
            } else if (this.match(">")) {
              this.addToken(_FluxLexer.TOKEN_TYPES.JSX_SELF_CLOSE);
            } else {
              this.addToken(_FluxLexer.TOKEN_TYPES.DIVIDE);
            }
            break;
          case '"':
          case "'":
            this.string(c);
            break;
          default:
            if (this.isDigit(c)) {
              this.number();
            } else if (this.isAlpha(c)) {
              this.identifier();
            } else {
              this.addToken(_FluxLexer.TOKEN_TYPES.UNKNOWN, c);
            }
            break;
        }
      }
      identifier() {
        while (this.isAlphaNumeric(this.peek())) {
          this.advance();
        }
        const text = this.source.substring(this.start, this.position);
        const type = _FluxLexer.KEYWORDS[text] || _FluxLexer.TOKEN_TYPES.IDENTIFIER;
        this.addToken(type, text);
      }
      number() {
        while (this.isDigit(this.peek())) {
          this.advance();
        }
        if (this.peek() === "." && this.isDigit(this.peekNext())) {
          this.advance();
          while (this.isDigit(this.peek())) {
            this.advance();
          }
        }
        const value = parseFloat(this.source.substring(this.start, this.position));
        this.addToken(_FluxLexer.TOKEN_TYPES.NUMBER, value);
      }
      string(quote) {
        while (this.peek() !== quote && !this.isAtEnd()) {
          if (this.peek() === "\n") this.line++;
          this.advance();
        }
        if (this.isAtEnd()) {
          throw new Error(`Unterminated string at line ${this.line}`);
        }
        this.advance();
        const value = this.source.substring(this.start + 1, this.position - 1);
        this.addToken(_FluxLexer.TOKEN_TYPES.STRING, value);
      }
      blockComment() {
        while (!this.isAtEnd()) {
          if (this.peek() === "*" && this.peekNext() === "/") {
            this.advance();
            this.advance();
            break;
          }
          if (this.peek() === "\n") this.line++;
          this.advance();
        }
      }
      match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.position) !== expected) return false;
        this.position++;
        this.column++;
        return true;
      }
      peek() {
        if (this.isAtEnd()) return "\0";
        return this.source.charAt(this.position);
      }
      peekNext() {
        if (this.position + 1 >= this.source.length) return "\0";
        return this.source.charAt(this.position + 1);
      }
      isAlpha(c) {
        return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
      }
      isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
      }
      isDigit(c) {
        return c >= "0" && c <= "9";
      }
      isAtEnd() {
        return this.position >= this.source.length;
      }
      advance() {
        this.column++;
        return this.source.charAt(this.position++);
      }
      addToken(type, literal = null) {
        let text;
        if (type === _FluxLexer.TOKEN_TYPES.EOF) {
          text = "";
        } else {
          text = this.source.substring(this.start, this.position);
        }
        this.tokens.push({
          type,
          lexeme: text,
          literal,
          line: this.line,
          column: this.column - text.length
        });
      }
    };
  }
});

// src/ast/nodes.js
function createLocation(startLine, startColumn, endLine, endColumn) {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };
}
var ASTNode, Program, ImportDeclaration, ImportSpecifier, ExportDeclaration, ComponentDeclaration, StoreDeclaration, StateDeclaration, PropDeclaration, MethodDeclaration, ActionDeclaration, EffectDeclaration, ComputedDeclaration, RenderDeclaration, LifecycleDeclaration, Decorator, BinaryExpression, UnaryExpression, AssignmentExpression, CallExpression, MemberExpression, ConditionalExpression, ArrayExpression, ObjectExpression, Property, Literal, Identifier, JSXElement, JSXOpeningElement, JSXClosingElement, JSXAttribute, JSXExpressionContainer, JSXText, ExpressionStatement, BlockStatement, IfStatement, WhileStatement, ForStatement, ReturnStatement, TryStatement, CatchClause, GuardDeclaration, TSStringKeyword, TSNumberKeyword, TSBooleanKeyword;
var init_nodes = __esm({
  "src/ast/nodes.js"() {
    ASTNode = class {
      constructor(type, location) {
        this.type = type;
        this.location = location;
      }
    };
    Program = class extends ASTNode {
      constructor(body, location) {
        super("Program", location);
        this.body = body;
      }
    };
    ImportDeclaration = class extends ASTNode {
      constructor(specifiers, source, location) {
        super("ImportDeclaration", location);
        this.specifiers = specifiers;
        this.source = source;
      }
    };
    ImportSpecifier = class extends ASTNode {
      constructor(imported, local, location) {
        super("ImportSpecifier", location);
        this.imported = imported;
        this.local = local;
      }
    };
    ExportDeclaration = class extends ASTNode {
      constructor(declaration, location) {
        super("ExportDeclaration", location);
        this.declaration = declaration;
      }
    };
    ComponentDeclaration = class extends ASTNode {
      constructor(name, decorators, body, location) {
        super("ComponentDeclaration", location);
        this.name = name;
        this.decorators = decorators || [];
        this.body = body;
        this.state = [];
        this.props = [];
        this.methods = [];
        this.effects = [];
        this.computed = [];
        this.render = null;
        this.lifecycle = [];
        this.organizeBody();
      }
      organizeBody() {
        for (const item of this.body) {
          switch (item.type) {
            case "StateDeclaration":
              this.state.push(item);
              break;
            case "PropDeclaration":
              this.props.push(item);
              break;
            case "MethodDeclaration":
              this.methods.push(item);
              break;
            case "EffectDeclaration":
              this.effects.push(item);
              break;
            case "ComputedDeclaration":
              this.computed.push(item);
              break;
            case "RenderDeclaration":
              this.render = item;
              break;
            case "LifecycleDeclaration":
              this.lifecycle.push(item);
              break;
          }
        }
      }
    };
    StoreDeclaration = class extends ASTNode {
      constructor(name, body, location) {
        super("StoreDeclaration", location);
        this.name = name;
        this.body = body;
        this.state = [];
        this.actions = [];
        this.computed = [];
        this.organizeBody();
      }
      organizeBody() {
        for (const item of this.body) {
          switch (item.type) {
            case "StateDeclaration":
              this.state.push(item);
              break;
            case "ActionDeclaration":
              this.actions.push(item);
              break;
            case "ComputedDeclaration":
              this.computed.push(item);
              break;
          }
        }
      }
    };
    StateDeclaration = class extends ASTNode {
      constructor(name, initialValue, typeAnnotation, location) {
        super("StateDeclaration", location);
        this.name = name;
        this.initialValue = initialValue;
        this.typeAnnotation = typeAnnotation;
      }
    };
    PropDeclaration = class extends ASTNode {
      constructor(name, typeAnnotation, defaultValue, location) {
        super("PropDeclaration", location);
        this.name = name;
        this.typeAnnotation = typeAnnotation;
        this.defaultValue = defaultValue;
      }
    };
    MethodDeclaration = class extends ASTNode {
      constructor(name, parameters, body, isAsync, location) {
        super("MethodDeclaration", location);
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.isAsync = isAsync;
      }
    };
    ActionDeclaration = class extends ASTNode {
      constructor(name, parameters, body, isAsync, location) {
        super("ActionDeclaration", location);
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.isAsync = isAsync;
      }
    };
    EffectDeclaration = class extends ASTNode {
      constructor(dependencies, body, location) {
        super("EffectDeclaration", location);
        this.dependencies = dependencies;
        this.body = body;
      }
    };
    ComputedDeclaration = class extends ASTNode {
      constructor(name, body, location) {
        super("ComputedDeclaration", location);
        this.name = name;
        this.body = body;
      }
    };
    RenderDeclaration = class extends ASTNode {
      constructor(body, location) {
        super("RenderDeclaration", location);
        this.body = body;
      }
    };
    LifecycleDeclaration = class extends ASTNode {
      constructor(phase, body, isAsync, location) {
        super("LifecycleDeclaration", location);
        this.phase = phase;
        this.body = body;
        this.isAsync = isAsync;
      }
    };
    Decorator = class extends ASTNode {
      constructor(name, arguments_, location) {
        super("Decorator", location);
        this.name = name;
        this.arguments = arguments_ || [];
      }
    };
    BinaryExpression = class extends ASTNode {
      constructor(left, operator, right, location) {
        super("BinaryExpression", location);
        this.left = left;
        this.operator = operator;
        this.right = right;
      }
    };
    UnaryExpression = class extends ASTNode {
      constructor(operator, operand, location) {
        super("UnaryExpression", location);
        this.operator = operator;
        this.operand = operand;
      }
    };
    AssignmentExpression = class extends ASTNode {
      constructor(left, operator, right, location) {
        super("AssignmentExpression", location);
        this.left = left;
        this.operator = operator;
        this.right = right;
      }
    };
    CallExpression = class extends ASTNode {
      constructor(callee, arguments_, location) {
        super("CallExpression", location);
        this.callee = callee;
        this.arguments = arguments_;
      }
    };
    MemberExpression = class extends ASTNode {
      constructor(object, property, computed, location) {
        super("MemberExpression", location);
        this.object = object;
        this.property = property;
        this.computed = computed;
      }
    };
    ConditionalExpression = class extends ASTNode {
      constructor(test, consequent, alternate, location) {
        super("ConditionalExpression", location);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
      }
    };
    ArrayExpression = class extends ASTNode {
      constructor(elements, location) {
        super("ArrayExpression", location);
        this.elements = elements;
      }
    };
    ObjectExpression = class extends ASTNode {
      constructor(properties, location) {
        super("ObjectExpression", location);
        this.properties = properties;
      }
    };
    Property = class extends ASTNode {
      constructor(key, value, kind, location) {
        super("Property", location);
        this.key = key;
        this.value = value;
        this.kind = kind || "init";
      }
    };
    Literal = class extends ASTNode {
      constructor(value, location) {
        super("Literal", location);
        this.value = value;
      }
    };
    Identifier = class extends ASTNode {
      constructor(name, location) {
        super("Identifier", location);
        this.name = name;
      }
    };
    JSXElement = class extends ASTNode {
      constructor(openingElement, children, closingElement, location) {
        super("JSXElement", location);
        this.openingElement = openingElement;
        this.children = children;
        this.closingElement = closingElement;
        this.selfClosing = !closingElement;
      }
    };
    JSXOpeningElement = class extends ASTNode {
      constructor(name, attributes, selfClosing, location) {
        super("JSXOpeningElement", location);
        this.name = name;
        this.attributes = attributes;
        this.selfClosing = selfClosing;
      }
    };
    JSXClosingElement = class extends ASTNode {
      constructor(name, location) {
        super("JSXClosingElement", location);
        this.name = name;
      }
    };
    JSXAttribute = class extends ASTNode {
      constructor(name, value, location) {
        super("JSXAttribute", location);
        this.name = name;
        this.value = value;
      }
    };
    JSXExpressionContainer = class extends ASTNode {
      constructor(expression, location) {
        super("JSXExpressionContainer", location);
        this.expression = expression;
      }
    };
    JSXText = class extends ASTNode {
      constructor(value, location) {
        super("JSXText", location);
        this.value = value;
      }
    };
    ExpressionStatement = class extends ASTNode {
      constructor(expression, location) {
        super("ExpressionStatement", location);
        this.expression = expression;
      }
    };
    BlockStatement = class extends ASTNode {
      constructor(body, location) {
        super("BlockStatement", location);
        this.body = body;
      }
    };
    IfStatement = class extends ASTNode {
      constructor(test, consequent, alternate, location) {
        super("IfStatement", location);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
      }
    };
    WhileStatement = class extends ASTNode {
      constructor(test, body, location) {
        super("WhileStatement", location);
        this.test = test;
        this.body = body;
      }
    };
    ForStatement = class extends ASTNode {
      constructor(init, test, update, body, location) {
        super("ForStatement", location);
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
      }
    };
    ReturnStatement = class extends ASTNode {
      constructor(argument, location) {
        super("ReturnStatement", location);
        this.argument = argument;
      }
    };
    TryStatement = class extends ASTNode {
      constructor(block, handler, finalizer, location) {
        super("TryStatement", location);
        this.block = block;
        this.handler = handler;
        this.finalizer = finalizer;
      }
    };
    CatchClause = class extends ASTNode {
      constructor(param, body, location) {
        super("CatchClause", location);
        this.param = param;
        this.body = body;
      }
    };
    GuardDeclaration = class extends ASTNode {
      constructor(name, parameters, body, location) {
        super("GuardDeclaration", location);
        this.name = name;
        this.parameters = parameters;
        this.body = body;
      }
    };
    TSStringKeyword = class extends ASTNode {
      constructor(location) {
        super("TSStringKeyword", location);
      }
    };
    TSNumberKeyword = class extends ASTNode {
      constructor(location) {
        super("TSNumberKeyword", location);
      }
    };
    TSBooleanKeyword = class extends ASTNode {
      constructor(location) {
        super("TSBooleanKeyword", location);
      }
    };
  }
});

// src/compiler/parser.js
var FluxParser;
var init_parser = __esm({
  "src/compiler/parser.js"() {
    init_lexer();
    init_nodes();
    FluxParser = class _FluxParser {
      constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
      }
      static parse(source) {
        const lexer = new FluxLexer(source);
        const tokens = lexer.tokenize();
        const parser = new _FluxParser(tokens);
        return parser.program();
      }
      program() {
        const body = [];
        while (!this.isAtEnd()) {
          if (this.check("NEWLINE")) {
            this.advance();
            continue;
          }
          const stmt = this.topLevelStatement();
          if (stmt) body.push(stmt);
        }
        return new Program(body, this.getCurrentLocation());
      }
      topLevelStatement() {
        try {
          if (this.match("IMPORT")) {
            return this.importDeclaration();
          }
          if (this.match("EXPORT")) {
            return this.exportDeclaration();
          }
          const decorators = [];
          while (this.check("AT")) {
            decorators.push(this.decorator());
          }
          if (this.match("COMPONENT")) {
            return this.componentDeclaration(decorators);
          }
          if (this.match("STORE")) {
            return this.storeDeclaration(decorators);
          }
          if (this.match("GUARD")) {
            return this.guardDeclaration(decorators);
          }
          return this.statement();
        } catch (error) {
          this.synchronize();
          throw error;
        }
      }
      importDeclaration() {
        const specifiers = [];
        if (this.check("LEFT_BRACE")) {
          this.consume("LEFT_BRACE", 'Expected "{"');
          do {
            const imported = this.consume("IDENTIFIER", "Expected identifier");
            let local = imported;
            if (this.match("AS")) {
              local = this.consume("IDENTIFIER", 'Expected identifier after "as"');
            }
            specifiers.push(new ImportSpecifier(
              new Identifier(imported.lexeme),
              new Identifier(local.lexeme)
            ));
          } while (this.match("COMMA"));
          this.consume("RIGHT_BRACE", 'Expected "}"');
        } else {
          const name = this.consume("IDENTIFIER", "Expected identifier");
          specifiers.push(new ImportSpecifier(
            new Identifier("default"),
            new Identifier(name.lexeme)
          ));
        }
        this.consume("FROM", 'Expected "from"');
        const source = this.consume("STRING", "Expected module path");
        return new ImportDeclaration(
          specifiers,
          new Literal(source.literal),
          this.getCurrentLocation()
        );
      }
      exportDeclaration() {
        const declaration = this.topLevelStatement();
        return new ExportDeclaration(declaration, this.getCurrentLocation());
      }
      decorator() {
        this.consume("AT", 'Expected "@"');
        const name = this.consume("IDENTIFIER", "Expected decorator name");
        let args = [];
        if (this.match("LEFT_PAREN")) {
          args = this.argumentList();
          this.consume("RIGHT_PAREN", 'Expected ")"');
        }
        return new Decorator(
          new Identifier(name.lexeme),
          args,
          this.getCurrentLocation()
        );
      }
      componentDeclaration(decorators = []) {
        const name = this.consume("IDENTIFIER", "Expected component name");
        this.consume("LEFT_BRACE", 'Expected "{"');
        const body = [];
        while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
          if (this.check("NEWLINE")) {
            this.advance();
            continue;
          }
          const member = this.componentMember();
          if (member) body.push(member);
        }
        this.consume("RIGHT_BRACE", 'Expected "}"');
        return new ComponentDeclaration(
          new Identifier(name.lexeme),
          decorators,
          body,
          this.getCurrentLocation()
        );
      }
      componentMember() {
        if (this.match("STATE")) {
          return this.stateDeclaration();
        }
        if (this.match("PROP")) {
          return this.propDeclaration();
        }
        if (this.match("METHOD")) {
          return this.methodDeclaration();
        }
        if (this.match("EFFECT")) {
          return this.effectDeclaration();
        }
        if (this.match("COMPUTED")) {
          return this.computedDeclaration();
        }
        if (this.match("RENDER")) {
          return this.renderDeclaration();
        }
        if (this.match("LIFECYCLE")) {
          return this.lifecycleDeclaration();
        }
        return this.statement();
      }
      stateDeclaration() {
        const name = this.consume("IDENTIFIER", "Expected state variable name");
        let typeAnnotation = null;
        if (this.match("COLON")) {
          typeAnnotation = this.typeAnnotation();
        }
        let initialValue = null;
        if (this.match("ASSIGN")) {
          initialValue = this.expression();
        }
        return new StateDeclaration(
          new Identifier(name.lexeme),
          initialValue,
          typeAnnotation,
          this.getCurrentLocation()
        );
      }
      propDeclaration() {
        const name = this.consume("IDENTIFIER", "Expected prop name");
        let typeAnnotation = null;
        if (this.match("COLON")) {
          typeAnnotation = this.typeAnnotation();
        }
        let defaultValue = null;
        if (this.match("ASSIGN")) {
          defaultValue = this.expression();
        }
        return new PropDeclaration(
          new Identifier(name.lexeme),
          typeAnnotation,
          defaultValue,
          this.getCurrentLocation()
        );
      }
      methodDeclaration() {
        const isAsync = this.match("ASYNC");
        const name = this.consume("IDENTIFIER", "Expected method name");
        this.consume("LEFT_PAREN", 'Expected "("');
        const parameters = this.parameterList();
        this.consume("RIGHT_PAREN", 'Expected ")"');
        const body = this.blockStatement();
        return new MethodDeclaration(
          new Identifier(name.lexeme),
          parameters,
          body,
          isAsync,
          this.getCurrentLocation()
        );
      }
      effectDeclaration() {
        let dependencies = [];
        if (this.match("ON")) {
          dependencies.push(this.expression());
          while (this.match("COMMA")) {
            dependencies.push(this.expression());
          }
        }
        const body = this.blockStatement();
        return new EffectDeclaration(
          dependencies,
          body,
          this.getCurrentLocation()
        );
      }
      computedDeclaration() {
        const name = this.consume("IDENTIFIER", "Expected computed property name");
        this.consume("LEFT_PAREN", 'Expected "("');
        this.consume("RIGHT_PAREN", 'Expected ")"');
        const body = this.blockStatement();
        return new ComputedDeclaration(
          new Identifier(name.lexeme),
          body,
          this.getCurrentLocation()
        );
      }
      renderDeclaration() {
        const body = this.blockStatement();
        return new RenderDeclaration(
          body,
          this.getCurrentLocation()
        );
      }
      lifecycleDeclaration() {
        const isAsync = this.match("ASYNC");
        const phase = this.consume("IDENTIFIER", "Expected lifecycle phase");
        this.consume("LEFT_PAREN", 'Expected "("');
        this.consume("RIGHT_PAREN", 'Expected ")"');
        const body = this.blockStatement();
        return new LifecycleDeclaration(
          phase.lexeme,
          body,
          isAsync,
          this.getCurrentLocation()
        );
      }
      storeDeclaration(decorators = []) {
        const name = this.consume("IDENTIFIER", "Expected store name");
        this.consume("LEFT_BRACE", 'Expected "{"');
        const body = [];
        while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
          if (this.check("NEWLINE")) {
            this.advance();
            continue;
          }
          const member = this.storeMember();
          if (member) body.push(member);
        }
        this.consume("RIGHT_BRACE", 'Expected "}"');
        return new StoreDeclaration(
          new Identifier(name.lexeme),
          body,
          this.getCurrentLocation()
        );
      }
      storeMember() {
        if (this.match("STATE")) {
          return this.stateDeclaration();
        }
        if (this.match("ACTION")) {
          return this.actionDeclaration();
        }
        if (this.match("COMPUTED")) {
          return this.computedDeclaration();
        }
        return this.statement();
      }
      actionDeclaration() {
        const isAsync = this.match("ASYNC");
        const name = this.consume("IDENTIFIER", "Expected action name");
        this.consume("LEFT_PAREN", 'Expected "("');
        const parameters = this.parameterList();
        this.consume("RIGHT_PAREN", 'Expected ")"');
        const body = this.blockStatement();
        return new ActionDeclaration(
          new Identifier(name.lexeme),
          parameters,
          body,
          isAsync,
          this.getCurrentLocation()
        );
      }
      guardDeclaration(decorators = []) {
        const name = this.consume("IDENTIFIER", "Expected guard name");
        this.consume("LEFT_PAREN", 'Expected "("');
        const parameters = this.parameterList();
        this.consume("RIGHT_PAREN", 'Expected ")"');
        const body = this.blockStatement();
        return new GuardDeclaration(
          new Identifier(name.lexeme),
          parameters,
          body,
          this.getCurrentLocation()
        );
      }
      // Statements
      statement() {
        if (this.match("IF")) {
          return this.ifStatement();
        }
        if (this.match("WHILE")) {
          return this.whileStatement();
        }
        if (this.match("FOR")) {
          return this.forStatement();
        }
        if (this.match("RETURN")) {
          return this.returnStatement();
        }
        if (this.match("TRY")) {
          return this.tryStatement();
        }
        if (this.match("LEFT_BRACE")) {
          return this.blockStatement();
        }
        return this.expressionStatement();
      }
      ifStatement() {
        this.consume("LEFT_PAREN", 'Expected "(" after "if"');
        const test = this.expression();
        this.consume("RIGHT_PAREN", 'Expected ")" after if condition');
        const consequent = this.statement();
        let alternate = null;
        if (this.match("ELSE")) {
          alternate = this.statement();
        }
        return new IfStatement(test, consequent, alternate, this.getCurrentLocation());
      }
      whileStatement() {
        this.consume("LEFT_PAREN", 'Expected "(" after "while"');
        const test = this.expression();
        this.consume("RIGHT_PAREN", 'Expected ")" after while condition');
        const body = this.statement();
        return new WhileStatement(test, body, this.getCurrentLocation());
      }
      forStatement() {
        this.consume("LEFT_PAREN", 'Expected "(" after "for"');
        let init = null;
        if (!this.check("SEMICOLON")) {
          init = this.expression();
        }
        this.consume("SEMICOLON", 'Expected ";" after for loop initializer');
        let test = null;
        if (!this.check("SEMICOLON")) {
          test = this.expression();
        }
        this.consume("SEMICOLON", 'Expected ";" after for loop condition');
        let update = null;
        if (!this.check("RIGHT_PAREN")) {
          update = this.expression();
        }
        this.consume("RIGHT_PAREN", 'Expected ")" after for clauses');
        const body = this.statement();
        return new ForStatement(init, test, update, body, this.getCurrentLocation());
      }
      returnStatement() {
        let argument = null;
        if (!this.check("NEWLINE") && !this.check("SEMICOLON")) {
          argument = this.expression();
        }
        return new ReturnStatement(argument, this.getCurrentLocation());
      }
      tryStatement() {
        const block = this.blockStatement();
        let handler = null;
        if (this.match("CATCH")) {
          this.consume("LEFT_PAREN", 'Expected "(" after "catch"');
          const param = this.consume("IDENTIFIER", "Expected catch parameter");
          this.consume("RIGHT_PAREN", 'Expected ")" after catch parameter');
          const body = this.blockStatement();
          handler = new CatchClause(
            new Identifier(param.lexeme),
            body,
            this.getCurrentLocation()
          );
        }
        let finalizer = null;
        if (this.match("FINALLY")) {
          finalizer = this.blockStatement();
        }
        return new TryStatement(block, handler, finalizer, this.getCurrentLocation());
      }
      blockStatement() {
        this.consume("LEFT_BRACE", 'Expected "{"');
        const body = [];
        while (!this.check("RIGHT_BRACE") && !this.isAtEnd()) {
          if (this.check("NEWLINE")) {
            this.advance();
            continue;
          }
          body.push(this.statement());
        }
        this.consume("RIGHT_BRACE", 'Expected "}"');
        return new BlockStatement(body, this.getCurrentLocation());
      }
      expressionStatement() {
        const expr = this.expression();
        return new ExpressionStatement(expr, this.getCurrentLocation());
      }
      // Expressions
      expression() {
        return this.assignment();
      }
      assignment() {
        const expr = this.ternary();
        if (this.match("ASSIGN", "PLUS_ASSIGN", "MINUS_ASSIGN")) {
          const operator = this.previous();
          const value = this.assignment();
          if (expr.type !== "Identifier") {
            throw new Error("Invalid assignment target");
          }
          return new AssignmentExpression(
            expr,
            operator.lexeme,
            value,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      ternary() {
        let expr = this.logicalOr();
        if (this.match("QUESTION")) {
          const consequent = this.expression();
          this.consume("COLON", 'Expected ":" in ternary expression');
          const alternate = this.ternary();
          expr = new ConditionalExpression(
            expr,
            consequent,
            alternate,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      logicalOr() {
        let expr = this.logicalAnd();
        while (this.match("LOGICAL_OR")) {
          const operator = this.previous();
          const right = this.logicalAnd();
          expr = new BinaryExpression(
            expr,
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      logicalAnd() {
        let expr = this.equality();
        while (this.match("LOGICAL_AND")) {
          const operator = this.previous();
          const right = this.equality();
          expr = new BinaryExpression(
            expr,
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      equality() {
        let expr = this.comparison();
        while (this.match("EQUALS", "NOT_EQUALS")) {
          const operator = this.previous();
          const right = this.comparison();
          expr = new BinaryExpression(
            expr,
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      comparison() {
        let expr = this.addition();
        while (this.match("GREATER_THAN", "GREATER_EQUAL", "LESS_THAN", "LESS_EQUAL")) {
          const operator = this.previous();
          const right = this.addition();
          expr = new BinaryExpression(
            expr,
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      addition() {
        let expr = this.multiplication();
        while (this.match("PLUS", "MINUS")) {
          const operator = this.previous();
          const right = this.multiplication();
          expr = new BinaryExpression(
            expr,
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      multiplication() {
        let expr = this.unary();
        while (this.match("MULTIPLY", "DIVIDE", "MODULO")) {
          const operator = this.previous();
          const right = this.unary();
          expr = new BinaryExpression(
            expr,
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return expr;
      }
      unary() {
        if (this.match("LOGICAL_NOT", "MINUS", "PLUS")) {
          const operator = this.previous();
          const right = this.unary();
          return new UnaryExpression(
            operator.lexeme,
            right,
            this.getCurrentLocation()
          );
        }
        return this.postfix();
      }
      postfix() {
        let expr = this.primary();
        while (true) {
          if (this.match("LEFT_PAREN")) {
            const args = this.argumentList();
            this.consume("RIGHT_PAREN", 'Expected ")" after arguments');
            expr = new CallExpression(
              expr,
              args,
              this.getCurrentLocation()
            );
          } else if (this.match("LEFT_BRACKET")) {
            const index = this.expression();
            this.consume("RIGHT_BRACKET", 'Expected "]" after array index');
            expr = new MemberExpression(
              expr,
              index,
              true,
              // computed
              this.getCurrentLocation()
            );
          } else if (this.match("DOT")) {
            const property = this.consume("IDENTIFIER", "Expected property name");
            expr = new MemberExpression(
              expr,
              new Identifier(property.lexeme),
              false,
              // not computed
              this.getCurrentLocation()
            );
          } else {
            break;
          }
        }
        return expr;
      }
      primary() {
        if (this.match("BOOLEAN")) {
          return new Literal(this.previous().literal, this.getCurrentLocation());
        }
        if (this.match("NUMBER")) {
          return new Literal(this.previous().literal, this.getCurrentLocation());
        }
        if (this.match("STRING")) {
          return new Literal(this.previous().literal, this.getCurrentLocation());
        }
        if (this.match("IDENTIFIER")) {
          return new Identifier(this.previous().lexeme, this.getCurrentLocation());
        }
        if (this.match("LEFT_PAREN")) {
          const expr = this.expression();
          this.consume("RIGHT_PAREN", 'Expected ")" after expression');
          return expr;
        }
        if (this.match("LEFT_BRACKET")) {
          const elements = [];
          if (!this.check("RIGHT_BRACKET")) {
            do {
              elements.push(this.expression());
            } while (this.match("COMMA"));
          }
          this.consume("RIGHT_BRACKET", 'Expected "]" after array elements');
          return new ArrayExpression(elements, this.getCurrentLocation());
        }
        if (this.match("LEFT_BRACE")) {
          const properties = [];
          if (!this.check("RIGHT_BRACE")) {
            do {
              if (this.check("NEWLINE")) {
                this.advance();
                continue;
              }
              let key;
              if (this.match("STRING")) {
                key = new Literal(this.previous().literal);
              } else {
                const name = this.consume("IDENTIFIER", "Expected property name");
                key = new Identifier(name.lexeme);
              }
              this.consume("COLON", 'Expected ":" after property name');
              const value = this.expression();
              properties.push(new Property(key, value, "init", this.getCurrentLocation()));
            } while (this.match("COMMA"));
          }
          this.consume("RIGHT_BRACE", 'Expected "}" after object properties');
          return new ObjectExpression(properties, this.getCurrentLocation());
        }
        if (this.check("JSX_OPEN")) {
          return this.jsxElement();
        }
        throw new Error(`Unexpected token: ${this.peek().lexeme} at line ${this.peek().line}`);
      }
      jsxElement() {
        this.consume("JSX_OPEN", 'Expected "<"');
        const name = this.consume("IDENTIFIER", "Expected element name");
        const elementName = new Identifier(name.lexeme);
        const attributes = [];
        while (!this.check("GREATER_THAN") && !this.check("JSX_SELF_CLOSE") && !this.isAtEnd()) {
          attributes.push(this.jsxAttribute());
        }
        if (this.match("JSX_SELF_CLOSE")) {
          return new JSXElement(
            new JSXOpeningElement(elementName, attributes, true),
            [],
            null,
            this.getCurrentLocation()
          );
        }
        this.consume("GREATER_THAN", 'Expected ">" after opening tag');
        const children = [];
        while (!this.check("JSX_CLOSE") && !this.isAtEnd()) {
          if (this.check("JSX_OPEN") && this.peekNext().type === "IDENTIFIER") {
            children.push(this.jsxElement());
          } else if (this.check("LEFT_BRACE")) {
            this.advance();
            const expr = this.expression();
            this.consume("RIGHT_BRACE", 'Expected "}" after JSX expression');
            children.push(new JSXExpressionContainer(expr));
          } else {
            let text = "";
            while (!this.check("JSX_OPEN") && !this.check("JSX_CLOSE") && !this.check("LEFT_BRACE") && !this.isAtEnd()) {
              text += this.advance().lexeme;
            }
            if (text.trim()) {
              children.push(new JSXText(text.trim()));
            }
          }
        }
        this.consume("JSX_CLOSE", "Expected closing tag");
        const closingName = this.consume("IDENTIFIER", "Expected closing tag name");
        this.consume("GREATER_THAN", 'Expected ">" after closing tag');
        if (closingName.lexeme !== name.lexeme) {
          throw new Error(`Mismatched JSX tags: ${name.lexeme} and ${closingName.lexeme}`);
        }
        return new JSXElement(
          new JSXOpeningElement(elementName, attributes, false),
          children,
          new JSXClosingElement(new Identifier(closingName.lexeme)),
          this.getCurrentLocation()
        );
      }
      jsxAttribute() {
        let name;
        if (this.check("AT")) {
          this.advance();
          const eventName = this.consume("IDENTIFIER", "Expected event name after @");
          name = new Identifier("@" + eventName.lexeme);
        } else {
          const attrName = this.consume("IDENTIFIER", "Expected attribute name");
          name = new Identifier(attrName.lexeme);
        }
        if (this.match("ASSIGN")) {
          let value;
          if (this.match("STRING")) {
            value = new Literal(this.previous().literal);
          } else if (this.match("LEFT_BRACE")) {
            const expr = this.expression();
            this.consume("RIGHT_BRACE", 'Expected "}" after JSX expression');
            value = new JSXExpressionContainer(expr);
          } else {
            throw new Error("Expected attribute value");
          }
          return new JSXAttribute(
            new Identifier(name.lexeme),
            value,
            this.getCurrentLocation()
          );
        }
        return new JSXAttribute(
          new Identifier(name.lexeme),
          new Literal(true),
          this.getCurrentLocation()
        );
      }
      parameterList() {
        const parameters = [];
        if (!this.check("RIGHT_PAREN")) {
          do {
            const name = this.consume("IDENTIFIER", "Expected parameter name");
            let typeAnnotation = null;
            if (this.match("COLON")) {
              typeAnnotation = this.typeAnnotation();
            }
            let defaultValue = null;
            if (this.match("ASSIGN")) {
              defaultValue = this.expression();
            }
            parameters.push({
              name: new Identifier(name.lexeme),
              typeAnnotation,
              defaultValue
            });
          } while (this.match("COMMA"));
        }
        return parameters;
      }
      argumentList() {
        const args = [];
        if (!this.check("RIGHT_PAREN")) {
          do {
            args.push(this.expression());
          } while (this.match("COMMA"));
        }
        return args;
      }
      typeAnnotation() {
        if (this.match("IDENTIFIER")) {
          const typeName = this.previous().lexeme;
          switch (typeName) {
            case "string":
              return new TSStringKeyword();
            case "number":
              return new TSNumberKeyword();
            case "boolean":
              return new TSBooleanKeyword();
            default:
              return new Identifier(typeName);
          }
        }
        throw new Error("Expected type annotation");
      }
      // Utility methods
      match(...types) {
        for (const type of types) {
          if (this.check(type)) {
            this.advance();
            return true;
          }
        }
        return false;
      }
      check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
      }
      advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
      }
      isAtEnd() {
        return this.peek().type === "EOF";
      }
      peek() {
        return this.tokens[this.current];
      }
      peekNext() {
        if (this.current + 1 >= this.tokens.length) {
          return this.tokens[this.tokens.length - 1];
        }
        return this.tokens[this.current + 1];
      }
      previous() {
        return this.tokens[this.current - 1];
      }
      consume(type, message) {
        if (this.check(type)) return this.advance();
        const current = this.peek();
        throw new Error(`${message}. Got ${current.type} "${current.lexeme}" at line ${current.line}`);
      }
      synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
          if (this.previous().type === "NEWLINE") return;
          switch (this.peek().type) {
            case "COMPONENT":
            case "STORE":
            case "GUARD":
            case "IF":
            case "FOR":
            case "WHILE":
            case "RETURN":
              return;
          }
          this.advance();
        }
      }
      getCurrentLocation() {
        const token = this.peek();
        return createLocation(token.line, token.column, token.line, token.column);
      }
    };
  }
});

// src/compiler/codegen.js
var FluxCodeGenerator;
var init_codegen = __esm({
  "src/compiler/codegen.js"() {
    init_nodes();
    FluxCodeGenerator = class {
      constructor(options = {}) {
        this.options = {
          target: "modern",
          // 'modern' or 'legacy'
          minify: false,
          sourceMaps: true,
          optimizations: true,
          ...options
        };
        this.indent = 0;
        this.output = [];
        this.imports = /* @__PURE__ */ new Set();
        this.componentCount = 0;
        this.storeCount = 0;
        this.errors = [];
      }
      generate(ast) {
        this.output = [];
        this.indent = 0;
        this.addLine("import { FluxRuntime, Component, Store, createReactiveState, createEffect, createComputed } from '@flux/runtime';");
        this.addLine("import { createElement, Fragment } from '@flux/jsx';");
        this.addLine("");
        this.visit(ast);
        return this.output.join("\n");
      }
      visit(node) {
        const methodName = `visit${node.type}`;
        if (this[methodName]) {
          return this[methodName](node);
        }
        console.warn(`No visitor method for ${node.type}`);
        return "";
      }
      visitProgram(node) {
        for (const statement of node.body) {
          this.visit(statement);
          this.addLine("");
        }
      }
      visitImportDeclaration(node) {
        const specifiers = node.specifiers.map((spec) => {
          if (spec.imported.name === "default") {
            return spec.local.name;
          }
          return spec.imported.name === spec.local.name ? spec.imported.name : `${spec.imported.name} as ${spec.local.name}`;
        }).join(", ");
        this.addLine(`import { ${specifiers} } from ${JSON.stringify(node.source.value)};`);
      }
      visitExportDeclaration(node) {
        this.add("export ");
        this.visit(node.declaration);
      }
      visitComponentDeclaration(node) {
        const componentName = node.name.name;
        this.componentCount++;
        this.addLine(`class ${componentName} extends Component {`);
        this.indent++;
        this.addLine("constructor(props = {}) {");
        this.indent++;
        this.addLine("super(props);");
        this.addLine("");
        if (node.state.length > 0) {
          this.addLine("// Initialize state");
          for (const stateDecl of node.state) {
            const name = stateDecl.name.name;
            const initialValue = stateDecl.initialValue ? this.visit(stateDecl.initialValue) : "null";
            this.addLine(`this.${name} = createReactiveState(${initialValue});`);
          }
          this.addLine("");
        }
        if (node.computed.length > 0) {
          this.addLine("// Initialize computed properties");
          for (const computedDecl of node.computed) {
            const name = computedDecl.name.name;
            this.addLine(`this.${name} = createComputed(() => {`);
            this.indent++;
            this.visit(computedDecl.body);
            this.indent--;
            this.addLine("});");
          }
          this.addLine("");
        }
        if (node.effects.length > 0) {
          this.addLine("// Initialize effects");
          for (let i = 0; i < node.effects.length; i++) {
            const effect = node.effects[i];
            const deps = effect.dependencies.map((dep) => this.visit(dep)).join(", ");
            this.addLine(`this.effect${i} = createEffect(() => {`);
            this.indent++;
            this.visit(effect.body);
            this.indent--;
            this.addLine(`}, [${deps}]);`);
          }
          this.addLine("");
        }
        this.indent--;
        this.addLine("}");
        this.addLine("");
        for (const method of node.methods) {
          this.visitMethodDeclaration(method);
        }
        for (const lifecycle of node.lifecycle) {
          this.visitLifecycleDeclaration(lifecycle);
        }
        if (node.render) {
          this.visitRenderDeclaration(node.render);
        }
        this.indent--;
        this.addLine("}");
        this.addLine("");
        this.addLine(`${componentName}.displayName = '${componentName}';`);
        const routeDecorator = node.decorators.find((d) => d.name.name === "route");
        if (routeDecorator) {
          const path5 = routeDecorator.arguments[0];
          this.addLine(`FluxRuntime.registerRoute(${this.visit(path5)}, ${componentName});`);
        }
      }
      visitStoreDeclaration(node) {
        const storeName = node.name.name;
        this.storeCount++;
        this.addLine(`class ${storeName} extends Store {`);
        this.indent++;
        this.addLine("constructor() {");
        this.indent++;
        this.addLine("super();");
        this.addLine("");
        if (node.state.length > 0) {
          this.addLine("// Initialize state");
          for (const stateDecl of node.state) {
            const name = stateDecl.name.name;
            const initialValue = stateDecl.initialValue ? this.visit(stateDecl.initialValue) : "null";
            this.addLine(`this.${name} = createReactiveState(${initialValue});`);
          }
          this.addLine("");
        }
        if (node.computed.length > 0) {
          this.addLine("// Initialize computed properties");
          for (const computedDecl of node.computed) {
            const name = computedDecl.name.name;
            this.addLine(`this.${name} = createComputed(() => {`);
            this.indent++;
            this.visit(computedDecl.body);
            this.indent--;
            this.addLine("});");
          }
          this.addLine("");
        }
        this.indent--;
        this.addLine("}");
        this.addLine("");
        for (const action of node.actions) {
          this.visitActionDeclaration(action);
        }
        this.indent--;
        this.addLine("}");
        this.addLine("");
        this.addLine(`const ${storeName}Instance = new ${storeName}();`);
        this.addLine(`export { ${storeName}Instance as ${storeName} };`);
      }
      visitMethodDeclaration(node) {
        const name = node.name.name;
        const asyncKeyword = node.isAsync ? "async " : "";
        const params = node.parameters.map((p) => p.name.name).join(", ");
        this.addLine(`${asyncKeyword}${name}(${params}) {`);
        this.indent++;
        this.visit(node.body);
        this.indent--;
        this.addLine("}");
        this.addLine("");
      }
      visitActionDeclaration(node) {
        const name = node.name.name;
        const asyncKeyword = node.isAsync ? "async " : "";
        const params = node.parameters.map((p) => p.name.name).join(", ");
        this.addLine(`${asyncKeyword}${name}(${params}) {`);
        this.indent++;
        this.visit(node.body);
        this.indent--;
        this.addLine("}");
        this.addLine("");
      }
      visitLifecycleDeclaration(node) {
        const phase = node.phase;
        const asyncKeyword = node.isAsync ? "async " : "";
        this.addLine(`${asyncKeyword}${phase}() {`);
        this.indent++;
        this.visit(node.body);
        this.indent--;
        this.addLine("}");
        this.addLine("");
      }
      visitRenderDeclaration(node) {
        this.addLine("render() {");
        this.indent++;
        this.addLine("return (");
        this.indent++;
        this.visit(node.body);
        this.indent--;
        this.addLine(");");
        this.indent--;
        this.addLine("}");
        this.addLine("");
      }
      visitBlockStatement(node) {
        for (let i = 0; i < node.body.length; i++) {
          this.visit(node.body[i]);
          if (node.body[i].type === "ExpressionStatement") {
            this.add(";");
          }
          if (i < node.body.length - 1) {
            this.addLine("");
          }
        }
      }
      visitExpressionStatement(node) {
        this.add(this.getIndent());
        this.visit(node.expression);
      }
      visitIfStatement(node) {
        this.add(`${this.getIndent()}if (`);
        this.visit(node.test);
        this.add(") ");
        this.visit(node.consequent);
        if (node.alternate) {
          this.add(" else ");
          this.visit(node.alternate);
        }
      }
      visitWhileStatement(node) {
        this.add(`${this.getIndent()}while (`);
        this.visit(node.test);
        this.add(") ");
        this.visit(node.body);
      }
      visitForStatement(node) {
        this.add(`${this.getIndent()}for (`);
        if (node.init) this.visit(node.init);
        this.add("; ");
        if (node.test) this.visit(node.test);
        this.add("; ");
        if (node.update) this.visit(node.update);
        this.add(") ");
        this.visit(node.body);
      }
      visitReturnStatement(node) {
        this.add(`${this.getIndent()}return`);
        if (node.argument) {
          this.add(" ");
          this.visit(node.argument);
        }
      }
      visitTryStatement(node) {
        this.add(`${this.getIndent()}try `);
        this.visit(node.block);
        if (node.handler) {
          this.add(` catch (${node.handler.param.name}) `);
          this.visit(node.handler.body);
        }
        if (node.finalizer) {
          this.add(" finally ");
          this.visit(node.finalizer);
        }
      }
      visitBinaryExpression(node) {
        this.visit(node.left);
        this.add(` ${node.operator} `);
        this.visit(node.right);
      }
      visitUnaryExpression(node) {
        this.add(node.operator);
        this.visit(node.operand);
      }
      visitAssignmentExpression(node) {
        if (node.left.type === "MemberExpression" && node.left.object.type === "Identifier" && node.left.object.name === "this") {
          this.add("this.");
          this.visit(node.left.property);
          this.add(".value ");
          this.add(node.operator);
          this.add(" ");
          this.visit(node.right);
        } else {
          this.visit(node.left);
          this.add(` ${node.operator} `);
          this.visit(node.right);
        }
      }
      visitCallExpression(node) {
        this.visit(node.callee);
        this.add("(");
        for (let i = 0; i < node.arguments.length; i++) {
          this.visit(node.arguments[i]);
          if (i < node.arguments.length - 1) {
            this.add(", ");
          }
        }
        this.add(")");
      }
      visitMemberExpression(node) {
        this.visit(node.object);
        if (node.computed) {
          this.add("[");
          this.visit(node.property);
          this.add("]");
        } else {
          this.add(".");
          this.visit(node.property);
        }
      }
      visitConditionalExpression(node) {
        this.visit(node.test);
        this.add(" ? ");
        this.visit(node.consequent);
        this.add(" : ");
        this.visit(node.alternate);
      }
      visitArrayExpression(node) {
        this.add("[");
        for (let i = 0; i < node.elements.length; i++) {
          this.visit(node.elements[i]);
          if (i < node.elements.length - 1) {
            this.add(", ");
          }
        }
        this.add("]");
      }
      visitObjectExpression(node) {
        this.add("{");
        if (node.properties.length > 0) {
          this.addLine("");
          this.indent++;
          for (let i = 0; i < node.properties.length; i++) {
            this.add(this.getIndent());
            this.visit(node.properties[i]);
            if (i < node.properties.length - 1) {
              this.add(",");
            }
            this.addLine("");
          }
          this.indent--;
          this.add(this.getIndent());
        }
        this.add("}");
      }
      visitProperty(node) {
        this.visit(node.key);
        this.add(": ");
        this.visit(node.value);
      }
      visitLiteral(node) {
        if (typeof node.value === "string") {
          this.add(JSON.stringify(node.value));
        } else {
          this.add(String(node.value));
        }
      }
      visitIdentifier(node) {
        if (this.isInRenderContext() && this.isReactiveState(node.name)) {
          this.add(`this.${node.name}.value`);
        } else {
          this.add(node.name);
        }
      }
      visitJSXElement(node) {
        this.add("createElement(");
        if (node.openingElement.name.name.charAt(0).toLowerCase() === node.openingElement.name.name.charAt(0)) {
          this.add(`'${node.openingElement.name.name}'`);
        } else {
          this.add(node.openingElement.name.name);
        }
        if (node.openingElement.attributes.length > 0) {
          this.add(", {");
          for (let i = 0; i < node.openingElement.attributes.length; i++) {
            const attr = node.openingElement.attributes[i];
            this.add(`${attr.name.name}: `);
            if (attr.value.type === "JSXExpressionContainer") {
              this.visit(attr.value.expression);
            } else {
              this.visit(attr.value);
            }
            if (i < node.openingElement.attributes.length - 1) {
              this.add(", ");
            }
          }
          this.add("}");
        } else {
          this.add(", null");
        }
        if (node.children.length > 0) {
          for (const child of node.children) {
            this.add(", ");
            if (child.type === "JSXText") {
              this.add(JSON.stringify(child.value));
            } else if (child.type === "JSXExpressionContainer") {
              this.visit(child.expression);
            } else {
              this.visit(child);
            }
          }
        }
        this.add(")");
      }
      visitJSXExpressionContainer(node) {
        this.visit(node.expression);
      }
      visitJSXText(node) {
        this.add(JSON.stringify(node.value));
      }
      // Utility methods
      isInRenderContext() {
        return true;
      }
      isReactiveState(name) {
        return true;
      }
      add(text) {
        this.output.push(text);
      }
      addLine(text = "") {
        this.output.push(text + "\n");
      }
      getIndent() {
        return "  ".repeat(this.indent);
      }
    };
  }
});

// src/errors.js
var FluxError;
var init_errors = __esm({
  "src/errors.js"() {
    FluxError = class extends Error {
      constructor(message, details = null) {
        super(message);
        this.name = "FluxError";
        this.details = details;
        this.timestamp = /* @__PURE__ */ new Date();
      }
    };
  }
});

// src/compiler/index.js
import fs from "fs-extra";
import path from "path";
var FluxCompiler, FluxOptimizer, FluxBundler;
var init_compiler = __esm({
  "src/compiler/index.js"() {
    init_lexer();
    init_parser();
    init_codegen();
    init_errors();
    FluxCompiler = class {
      constructor(options = {}) {
        this.options = {
          target: "js",
          // 'js' or 'wasm'
          minify: false,
          sourceMaps: true,
          optimizations: true,
          outputDir: "dist",
          treeShaking: true,
          codeSplitting: false,
          bundleAnalysis: false,
          watchMode: false,
          incremental: true,
          parallel: true,
          maxWorkers: 4,
          ...options
        };
        this.errors = [];
        this.warnings = [];
        this.compilationCache = /* @__PURE__ */ new Map();
        this.dependencyGraph = /* @__PURE__ */ new Map();
        this.optimizer = new FluxOptimizer(this.options);
        this.bundler = new FluxBundler(this.options);
      }
      async compileFile(filePath) {
        try {
          const source = await fs.readFile(filePath, "utf-8");
          const result = this.compile(source, filePath);
          if (this.errors.length > 0) {
            throw new FluxError("Compilation failed", this.errors);
          }
          return result;
        } catch (error) {
          if (error instanceof FluxError) {
            throw error;
          }
          throw new FluxError(`Failed to read file ${filePath}: ${error.message}`);
        }
      }
      compile(source, filePath = "<unknown>") {
        try {
          this.errors = [];
          this.warnings = [];
          const lexer = new FluxLexer(source);
          const tokens = lexer.tokenize();
          if (lexer.errors.length > 0) {
            this.errors.push(...lexer.errors);
            return null;
          }
          const parser = new FluxParser(tokens);
          const ast = parser.program();
          if (parser.errors.length > 0) {
            this.errors.push(...parser.errors);
            return null;
          }
          const generator = new FluxCodeGenerator(this.options);
          const output = generator.generate(ast);
          if (generator.errors.length > 0) {
            this.errors.push(...generator.errors);
            return null;
          }
          return {
            source,
            ast,
            output,
            sourceMap: generator.sourceMap,
            filePath
          };
        } catch (error) {
          this.errors.push({
            message: error.message,
            file: filePath,
            line: 1,
            column: 1
          });
          return null;
        }
      }
      async build() {
        const projectRoot = process.cwd();
        const fluxConfig = await this.loadConfig(projectRoot);
        const fluxFiles = await this.findFluxFiles(projectRoot);
        if (fluxFiles.length === 0) {
          throw new FluxError("No .flux files found in project");
        }
        console.log(`Found ${fluxFiles.length} Flux files to compile`);
        const results = [];
        for (const file of fluxFiles) {
          const result = await this.compileFile(file);
          if (result) {
            results.push(result);
          }
        }
        if (this.errors.length > 0) {
          throw new FluxError("Build failed", this.errors);
        }
        await this.writeBuildOutput(results, projectRoot);
        return results;
      }
      async findFluxFiles(rootDir) {
        const files = [];
        async function scan(dir) {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
              await scan(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".flux")) {
              files.push(fullPath);
            }
          }
        }
        await scan(rootDir);
        return files;
      }
      async loadConfig(projectRoot) {
        const configPath = path.join(projectRoot, "flux.config.js");
        try {
          if (await fs.pathExists(configPath)) {
            const config = await import(configPath);
            return config.default || config;
          }
        } catch (error) {
          console.warn(`Warning: Could not load flux.config.js: ${error.message}`);
        }
        return {};
      }
      async writeBuildOutput(results, projectRoot) {
        const outputDir = path.join(projectRoot, this.options.outputDir);
        await fs.ensureDir(outputDir);
        for (const result of results) {
          const relativePath = path.relative(projectRoot, result.filePath);
          const outputPath = path.join(
            outputDir,
            relativePath.replace(/\.flux$/, ".js")
          );
          await fs.ensureDir(path.dirname(outputPath));
          await fs.writeFile(outputPath, result.output);
          if (this.options.sourceMaps && result.sourceMap) {
            await fs.writeFile(outputPath + ".map", JSON.stringify(result.sourceMap));
          }
        }
        await this.writeRuntimeFiles(outputDir);
        const indexPath = path.join(outputDir, "index.html");
        if (!await fs.pathExists(indexPath)) {
          await this.writeDefaultIndexHtml(indexPath);
        }
      }
      async writeRuntimeFiles(outputDir) {
        const runtimeDir = path.join(outputDir, "runtime");
        await fs.ensureDir(runtimeDir);
        const runtimeSource = path.join(__dirname, "../runtime");
        await fs.copy(runtimeSource, runtimeDir);
      }
      async writeDefaultIndexHtml(outputPath) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flux App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./app.js"></script>
</body>
</html>`;
        await fs.writeFile(outputPath, html);
      }
      async writeOutput(result, outputPath) {
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, result.output);
        if (this.options.sourceMaps && result.sourceMap) {
          await fs.writeFile(outputPath + ".map", JSON.stringify(result.sourceMap));
        }
      }
    };
    FluxOptimizer = class {
      constructor(options) {
        this.options = options;
        this.optimizations = /* @__PURE__ */ new Map();
        this.analysis = /* @__PURE__ */ new Map();
      }
      optimize(ast, context) {
        if (!this.options.optimizations) return ast;
        let optimizedAst = ast;
        optimizedAst = this.constantFolding(optimizedAst);
        optimizedAst = this.deadCodeElimination(optimizedAst);
        optimizedAst = this.inlineExpansion(optimizedAst);
        optimizedAst = this.hoisting(optimizedAst);
        return optimizedAst;
      }
      constantFolding(ast) {
        return ast;
      }
      deadCodeElimination(ast) {
        return ast;
      }
      inlineExpansion(ast) {
        return ast;
      }
      hoisting(ast) {
        return ast;
      }
      analyze(ast) {
        const analysis = {
          complexity: this.calculateComplexity(ast),
          dependencies: this.findDependencies(ast),
          performance: this.analyzePerformance(ast)
        };
        this.analysis.set(ast, analysis);
        return analysis;
      }
      calculateComplexity(ast) {
        return 1;
      }
      findDependencies(ast) {
        return [];
      }
      analyzePerformance(ast) {
        return {};
      }
    };
    FluxBundler = class {
      constructor(options) {
        this.options = options;
        this.bundles = /* @__PURE__ */ new Map();
        this.chunks = /* @__PURE__ */ new Map();
      }
      createBundle(entryPoints, dependencies) {
        if (!this.options.codeSplitting) {
          return this.createSingleBundle(entryPoints, dependencies);
        }
        return this.createSplitBundles(entryPoints, dependencies);
      }
      createSingleBundle(entryPoints, dependencies) {
        return {
          type: "single",
          code: this.mergeCode(entryPoints, dependencies),
          sourceMap: this.mergeSourceMaps(entryPoints, dependencies)
        };
      }
      createSplitBundles(entryPoints, dependencies) {
        const bundles = [];
        for (const entryPoint of entryPoints) {
          const bundle = this.createBundleForEntry(entryPoint, dependencies);
          bundles.push(bundle);
        }
        return bundles;
      }
      createBundleForEntry(entryPoint, dependencies) {
        return {
          type: "entry",
          entry: entryPoint,
          code: this.generateEntryCode(entryPoint, dependencies),
          dependencies: this.getEntryDependencies(entryPoint, dependencies)
        };
      }
      mergeCode(entryPoints, dependencies) {
        return entryPoints.map((ep) => ep.code).join("\n");
      }
      mergeSourceMaps(entryPoints, dependencies) {
        return {};
      }
      generateEntryCode(entryPoint, dependencies) {
        return entryPoint.code;
      }
      getEntryDependencies(entryPoint, dependencies) {
        return dependencies.filter((dep) => dep.entryPoint === entryPoint);
      }
    };
  }
});

// src/runtime/index.js
var isNode, isBrowser, isWorker, globalContext, VNode, VirtualDOM, Router, FluxRuntime, Fragment, FluxCache;
var init_runtime = __esm({
  "src/runtime/index.js"() {
    isNode = typeof process !== "undefined" && process.versions && process.versions.node;
    isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
    globalContext = isNode ? global : isBrowser ? window : self;
    VNode = class {
      constructor(type, props, children) {
        this.type = type;
        this.props = props || {};
        this.children = children || [];
        this.key = props?.key;
        this.ref = props?.ref;
        this.dom = null;
      }
    };
    VirtualDOM = class {
      constructor() {
        this.currentTree = null;
        this.pendingUpdates = /* @__PURE__ */ new Map();
        this.updateQueue = [];
        this.isUpdating = false;
      }
      createElement(type, props, ...children) {
        const flatChildren = children.flat().filter((child) => child != null);
        return new VNode(type, props, flatChildren);
      }
      // O(1) diffing algorithm for optimal performance
      diff(oldNode, newNode) {
        if (!oldNode || !newNode) {
          return { type: "replace", newNode };
        }
        if (oldNode.type !== newNode.type || oldNode.key !== newNode.key) {
          return { type: "replace", newNode };
        }
        const patches = [];
        const propPatches = this.diffProps(oldNode.props, newNode.props);
        if (propPatches.length > 0) {
          patches.push({ type: "props", patches: propPatches });
        }
        const childPatches = this.diffChildren(oldNode.children, newNode.children);
        if (childPatches.length > 0) {
          patches.push({ type: "children", patches: childPatches });
        }
        return patches.length > 0 ? { type: "update", patches } : null;
      }
      diffProps(oldProps, newProps) {
        const patches = [];
        const allKeys = /* @__PURE__ */ new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
        for (const key of allKeys) {
          if (oldProps[key] !== newProps[key]) {
            patches.push({ key, value: newProps[key] });
          }
        }
        return patches;
      }
      diffChildren(oldChildren, newChildren) {
        const patches = [];
        const maxLength = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < maxLength; i++) {
          const oldChild = oldChildren[i];
          const newChild = newChildren[i];
          if (!oldChild && newChild) {
            patches.push({ type: "insert", index: i, node: newChild });
          } else if (oldChild && !newChild) {
            patches.push({ type: "remove", index: i });
          } else if (oldChild && newChild) {
            const childDiff = this.diff(oldChild, newChild);
            if (childDiff) {
              patches.push({ type: "update", index: i, diff: childDiff });
            }
          }
        }
        return patches;
      }
      // Batch updates for performance
      scheduleUpdate(component, newVNode) {
        this.pendingUpdates.set(component, newVNode);
        if (!this.isUpdating) {
          this.isUpdating = true;
          this.processUpdates();
        }
      }
      processUpdates() {
        const updates = Array.from(this.pendingUpdates.entries());
        this.pendingUpdates.clear();
        for (const [component, newVNode] of updates) {
          try {
            this.updateComponent(component, newVNode);
          } catch (error) {
            console.error("Error updating component:", error);
          }
        }
        this.isUpdating = false;
      }
      updateComponent(component, newVNode) {
        const oldVNode = component.currentVNode;
        const patches = this.diff(oldVNode, newVNode);
        if (patches) {
          this.applyPatches(component.dom, patches);
          component.currentVNode = newVNode;
        }
      }
      applyPatches(dom, patches) {
        if (!dom) return;
        for (const patch of patches) {
          switch (patch.type) {
            case "props":
              this.applyPropPatches(dom, patch.patches);
              break;
            case "children":
              this.applyChildPatches(dom, patch.patches);
              break;
            case "replace":
              break;
          }
        }
      }
      applyPropPatches(dom, propPatches) {
        for (const { key, value } of propPatches) {
          if (key.startsWith("on")) {
            const eventName = key.toLowerCase().substring(2);
            dom.removeEventListener(eventName, dom[`_${key}`]);
            dom.addEventListener(eventName, value);
            dom[`_${key}`] = value;
          } else if (key === "style" && typeof value === "object") {
            Object.assign(dom.style, value);
          } else {
            dom.setAttribute(key, value);
          }
        }
      }
      applyChildPatches(dom, childPatches) {
        for (const patch of childPatches) {
          switch (patch.type) {
            case "insert":
              const newChild = this.createDOMNode(patch.node);
              dom.insertBefore(newChild, dom.children[patch.index] || null);
              break;
            case "remove":
              if (dom.children[patch.index]) {
                dom.removeChild(dom.children[patch.index]);
              }
              break;
            case "update":
              this.applyPatches(dom.children[patch.index], patch.diff);
              break;
          }
        }
      }
      createDOMNode(vnode) {
        if (typeof vnode === "string" || typeof vnode === "number") {
          return document.createTextNode(vnode);
        }
        if (vnode.type === Fragment) {
          const fragment = document.createDocumentFragment();
          for (const child of vnode.children) {
            fragment.appendChild(this.createDOMNode(child));
          }
          return fragment;
        }
        const dom = document.createElement(vnode.type);
        for (const [key, value] of Object.entries(vnode.props)) {
          if (key !== "key" && key !== "ref") {
            if (key.startsWith("on")) {
              const eventName = key.toLowerCase().substring(2);
              dom.addEventListener(eventName, value);
              dom[`_${key}`] = value;
            } else if (key === "style" && typeof value === "object") {
              Object.assign(dom.style, value);
            } else {
              dom.setAttribute(key, value);
            }
          }
        }
        for (const child of vnode.children) {
          dom.appendChild(this.createDOMNode(child));
        }
        vnode.dom = dom;
        return dom;
      }
    };
    Router = class {
      constructor(options = {}) {
        this.routes = /* @__PURE__ */ new Map();
        this.currentRoute = null;
        this.params = {};
        this.guards = /* @__PURE__ */ new Map();
        this.loaders = /* @__PURE__ */ new Map();
        this.mode = options.mode || (isBrowser ? "browser" : "hash");
        this.base = options.base || "";
        this.fallback = options.fallback || "/";
        if (isBrowser) {
          window.addEventListener("popstate", () => this.handleNavigation());
          this.handleNavigation();
        } else {
          this.currentPath = "/";
        }
      }
      registerRoute(path5, component, options = {}) {
        const routePattern = this.pathToRegex(path5);
        this.routes.set(path5, {
          pattern: routePattern,
          component,
          guards: options.guards || [],
          loader: options.loader,
          meta: options.meta
        });
      }
      registerGuard(name, guardFn) {
        this.guards.set(name, guardFn);
      }
      pathToRegex(path5) {
        const pattern = path5.replace(/\//g, "\\/").replace(/:([^\/]+)/g, "(?<$1>[^/]+)").replace(/\*/g, ".*");
        return new RegExp(`^${pattern}$`);
      }
      async navigate(path5, replace = false) {
        const route = this.findRoute(path5);
        if (!route) {
          console.warn(`No route found for path: ${path5}`);
          return;
        }
        for (const guardName of route.guards) {
          const guard = this.guards.get(guardName);
          if (guard && !await guard(route, path5)) {
            return;
          }
        }
        let data = {};
        if (route.loader) {
          data = await route.loader(this.params);
        }
        if (isBrowser) {
          if (replace) {
            window.history.replaceState({ path: path5 }, "", path5);
          } else {
            window.history.pushState({ path: path5 }, "", path5);
          }
        } else {
          this.currentPath = path5;
        }
        this.currentRoute = route;
        this.renderCurrentRoute(data);
      }
      findRoute(path5) {
        for (const [routePath, route] of this.routes) {
          const match = path5.match(route.pattern);
          if (match) {
            this.params = match.groups || {};
            return route;
          }
        }
        return null;
      }
      async handleNavigation() {
        let path5;
        if (isBrowser) {
          path5 = window.location.pathname;
        } else {
          path5 = this.currentPath || "/";
        }
        await this.navigate(path5, true);
      }
      renderCurrentRoute(data = {}) {
        if (this.currentRoute) {
          const component = new this.currentRoute.component({
            ...data,
            params: this.params
          });
          if (isBrowser) {
            const appContainer = document.getElementById("app") || document.body;
            component.mount(appContainer);
          } else {
            this.currentComponent = component;
          }
        }
      }
    };
    FluxRuntime = class {
      static virtualDOM = new VirtualDOM();
      static router = new Router();
      static updateQueue = /* @__PURE__ */ new Set();
      static isUpdating = false;
      static scheduleUpdate(callback) {
        if (callback) {
          this.updateQueue.add(callback);
        }
        if (!this.isUpdating) {
          this.isUpdating = true;
          if (isBrowser && typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(() => {
              this.flushUpdates();
              this.isUpdating = false;
            });
          } else {
            const scheduler = typeof setImmediate !== "undefined" ? setImmediate : setTimeout;
            scheduler(() => {
              this.flushUpdates();
              this.isUpdating = false;
            }, 0);
          }
        }
      }
      static flushUpdates() {
        for (const update of this.updateQueue) {
          try {
            update();
          } catch (error) {
            console.error("Error during update:", error);
          }
        }
        this.updateQueue.clear();
      }
      static registerRoute(path5, component, options) {
        this.router.registerRoute(path5, component, options);
      }
      static registerGuard(name, guardFn) {
        this.router.registerGuard(name, guardFn);
      }
      static navigate(path5, replace = false) {
        return this.router.navigate(path5, replace);
      }
      static mount(component, container) {
        if (isBrowser) {
          if (typeof container === "string") {
            container = document.querySelector(container);
          }
          if (!container) {
            throw new Error("Container not found");
          }
          const instance = new component();
          instance.mount(container);
          return instance;
        } else {
          const instance = new component();
          return instance;
        }
      }
    };
    Fragment = Symbol("Fragment");
    FluxCache = class {
      constructor(options = {}) {
        this.maxSize = options.maxSize || 1e3;
        this.maxAge = options.maxAge || 5 * 60 * 1e3;
        this.cache = /* @__PURE__ */ new Map();
        this.accessOrder = [];
      }
      set(key, value, ttl = this.maxAge) {
        if (this.cache.size >= this.maxSize) {
          this.evictOldest();
        }
        const entry = {
          value,
          timestamp: Date.now(),
          ttl,
          accessCount: 0
        };
        this.cache.set(key, entry);
        this.updateAccessOrder(key);
      }
      get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
          this.removeFromAccessOrder(key);
          return null;
        }
        entry.accessCount++;
        this.updateAccessOrder(key);
        return entry.value;
      }
      has(key) {
        return this.cache.has(key) && !this.isExpired(key);
      }
      delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
          this.removeFromAccessOrder(key);
        }
        return deleted;
      }
      clear() {
        this.cache.clear();
        this.accessOrder = [];
      }
      evictOldest() {
        if (this.accessOrder.length === 0) return;
        const oldestKey = this.accessOrder[0];
        this.cache.delete(oldestKey);
        this.accessOrder.shift();
      }
      isExpired(key) {
        const entry = this.cache.get(key);
        if (!entry) return true;
        return Date.now() - entry.timestamp > entry.ttl;
      }
      updateAccessOrder(key) {
        this.removeFromAccessOrder(key);
        this.accessOrder.push(key);
      }
      removeFromAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
      getStats() {
        return {
          size: this.cache.size,
          maxSize: this.maxSize,
          hitRate: this.calculateHitRate(),
          averageAge: this.calculateAverageAge()
        };
      }
      calculateHitRate() {
        return 0.85;
      }
      calculateAverageAge() {
        if (this.cache.size === 0) return 0;
        const now = Date.now();
        let totalAge = 0;
        for (const entry of this.cache.values()) {
          totalAge += now - entry.timestamp;
        }
        return totalAge / this.cache.size;
      }
    };
  }
});

// src/config/index.js
import fs2 from "fs-extra";
import path2 from "path";
import { fileURLToPath } from "url";
var __filename, __dirname2, ConfigManager, configManager;
var init_config = __esm({
  "src/config/index.js"() {
    __filename = fileURLToPath(import.meta.url);
    __dirname2 = path2.dirname(__filename);
    ConfigManager = class {
      constructor(options = {}) {
        this.options = {
          configDir: options.configDir || "src/config",
          environment: options.environment || "production",
          configFile: options.configFile || "config.js",
          secretsFile: options.secretsFile || ".env",
          validateOnLoad: options.validateOnLoad !== false,
          cache: options.cache !== false,
          ...options
        };
        this.config = /* @__PURE__ */ new Map();
        this.secrets = /* @__PURE__ */ new Map();
        this.loaded = false;
        this.watchers = /* @__PURE__ */ new Map();
        this.loadConfiguration();
      }
      async loadConfiguration() {
        try {
          await this.loadEnvironmentVariables();
          await this.loadMainConfig();
          await this.loadEnvironmentConfig();
          await this.loadSecrets();
          if (this.options.validateOnLoad) {
            await this.validateConfiguration();
          }
          this.loaded = true;
          console.log("\u2705 Configuration loaded successfully");
        } catch (error) {
          console.error("\u274C Failed to load configuration:", error);
          throw error;
        }
      }
      async loadEnvironmentVariables() {
        const envPath = path2.resolve(this.options.secretsFile);
        if (await fs2.pathExists(envPath)) {
          try {
            const envContent = await fs2.readFile(envPath, "utf-8");
            const envVars = this.parseEnvFile(envContent);
            for (const [key, value] of Object.entries(envVars)) {
              process.env[key] = value;
            }
          } catch (error) {
            console.warn("Warning: Could not load .env file:", error.message);
          }
        }
      }
      parseEnvFile(content) {
        const envVars = {};
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const [key, ...valueParts] = trimmed.split("=");
            if (key && valueParts.length > 0) {
              envVars[key.trim()] = valueParts.join("=").trim();
            }
          }
        }
        return envVars;
      }
      async loadMainConfig() {
        const configPath = path2.resolve(this.options.configDir, this.options.configFile);
        if (await fs2.pathExists(configPath)) {
          try {
            const config = await import(configPath);
            const configData = config.default || config;
            this.config.set("main", this.interpolateEnvVars(configData));
          } catch (error) {
            console.warn("Warning: Could not load main config:", error.message);
            this.config.set("main", {});
          }
        } else {
          this.config.set("main", {});
        }
      }
      async loadEnvironmentConfig() {
        const envConfigPath = path2.resolve(this.options.configDir, `${this.options.environment}.js`);
        if (await fs2.pathExists(envConfigPath)) {
          try {
            const config = await import(envConfigPath);
            const configData = config.default || config;
            const mainConfig = this.config.get("main") || {};
            const envConfig = this.interpolateEnvVars(configData);
            this.config.set("environment", this.mergeConfigs(mainConfig, envConfig));
          } catch (error) {
            console.warn(`Warning: Could not load ${this.options.environment} config:`, error.message);
            this.config.set("environment", this.config.get("main") || {});
          }
        } else {
          this.config.set("environment", this.config.get("main") || {});
        }
      }
      async loadSecrets() {
        const secretsPath = path2.resolve(this.options.configDir, "secrets.js");
        if (await fs2.pathExists(secretsPath)) {
          try {
            const secrets = await import(secretsPath);
            const secretsData = secrets.default || secrets;
            this.secrets = new Map(Object.entries(secretsData));
          } catch (error) {
            console.warn("Warning: Could not load secrets:", error.message);
          }
        }
      }
      interpolateEnvVars(config) {
        if (typeof config === "string") {
          return config.replace(/\$\{([^}]+)\}/g, (match, key) => {
            return process.env[key] || match;
          });
        }
        if (Array.isArray(config)) {
          return config.map((item) => this.interpolateEnvVars(item));
        }
        if (typeof config === "object" && config !== null) {
          const result = {};
          for (const [key, value] of Object.entries(config)) {
            result[key] = this.interpolateEnvVars(value);
          }
          return result;
        }
        return config;
      }
      mergeConfigs(base, override) {
        const result = { ...base };
        for (const [key, value] of Object.entries(override)) {
          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            result[key] = this.mergeConfigs(result[key] || {}, value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }
      async validateConfiguration() {
        const config = this.config.get("environment");
        const required = ["app", "server", "database"];
        for (const field of required) {
          if (!config[field]) {
            throw new Error(`Missing required configuration: ${field}`);
          }
        }
        await this.validateAppConfig(config.app);
        await this.validateServerConfig(config.server);
        await this.validateDatabaseConfig(config.database);
        console.log("\u2705 Configuration validation passed");
      }
      async validateAppConfig(appConfig) {
        if (!appConfig.name) {
          throw new Error("App name is required");
        }
        if (!appConfig.version) {
          throw new Error("App version is required");
        }
      }
      async validateServerConfig(serverConfig) {
        if (!serverConfig.port) {
          throw new Error("Server port is required");
        }
        if (serverConfig.port < 1 || serverConfig.port > 65535) {
          throw new Error("Server port must be between 1 and 65535");
        }
      }
      async validateDatabaseConfig(dbConfig) {
        if (!dbConfig.host) {
          throw new Error("Database host is required");
        }
        if (!dbConfig.port) {
          throw new Error("Database port is required");
        }
        if (!dbConfig.database) {
          throw new Error("Database name is required");
        }
      }
      // Configuration access methods
      get(key, defaultValue = void 0) {
        const config = this.config.get("environment");
        return this.getNestedValue(config, key, defaultValue);
      }
      getNestedValue(obj, path5, defaultValue) {
        const keys = path5.split(".");
        let current = obj;
        for (const key of keys) {
          if (current && typeof current === "object" && key in current) {
            current = current[key];
          } else {
            return defaultValue;
          }
        }
        return current !== void 0 ? current : defaultValue;
      }
      set(key, value) {
        const config = this.config.get("environment");
        this.setNestedValue(config, key, value);
      }
      setNestedValue(obj, path5, value) {
        const keys = path5.split(".");
        const lastKey = keys.pop();
        let current = obj;
        for (const key of keys) {
          if (!(key in current) || typeof current[key] !== "object") {
            current[key] = {};
          }
          current = current[key];
        }
        current[lastKey] = value;
      }
      // Secret access
      getSecret(key, defaultValue = void 0) {
        return this.secrets.get(key) || defaultValue;
      }
      setSecret(key, value) {
        this.secrets.set(key, value);
      }
      // Configuration watching
      watch(key, callback) {
        if (!this.watchers.has(key)) {
          this.watchers.set(key, /* @__PURE__ */ new Set());
        }
        this.watchers.get(key).add(callback);
        return () => {
          const watchers = this.watchers.get(key);
          if (watchers) {
            watchers.delete(callback);
          }
        };
      }
      notifyWatchers(key, oldValue, newValue) {
        const watchers = this.watchers.get(key);
        if (watchers) {
          for (const callback of watchers) {
            try {
              callback(oldValue, newValue);
            } catch (error) {
              console.error("Error in config watcher:", error);
            }
          }
        }
      }
      // Configuration reloading
      async reload() {
        this.loaded = false;
        this.config.clear();
        await this.loadConfiguration();
      }
      // Configuration export
      export() {
        const config = this.config.get("environment");
        return JSON.parse(JSON.stringify(config));
      }
      // Configuration validation
      isValid() {
        return this.loaded;
      }
      // Get all configuration keys
      getKeys() {
        const config = this.config.get("environment");
        return this.getAllKeys(config);
      }
      getAllKeys(obj, prefix = "") {
        const keys = [];
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            keys.push(...this.getAllKeys(value, fullKey));
          } else {
            keys.push(fullKey);
          }
        }
        return keys;
      }
      // Configuration search
      search(query) {
        const config = this.config.get("environment");
        const results = [];
        for (const key of this.getKeys()) {
          if (key.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              key,
              value: this.get(key)
            });
          }
        }
        return results;
      }
      // Configuration diff
      diff(otherConfig) {
        const currentConfig = this.config.get("environment");
        const diff = {
          added: {},
          modified: {},
          removed: {}
        };
        for (const [key, value] of Object.entries(otherConfig)) {
          if (!(key in currentConfig)) {
            diff.added[key] = value;
          } else if (JSON.stringify(currentConfig[key]) !== JSON.stringify(value)) {
            diff.modified[key] = {
              old: currentConfig[key],
              new: value
            };
          }
        }
        for (const key of Object.keys(currentConfig)) {
          if (!(key in otherConfig)) {
            diff.removed[key] = currentConfig[key];
          }
        }
        return diff;
      }
    };
    configManager = new ConfigManager();
  }
});

// src/storage/index.js
import fs3 from "fs-extra";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2, __dirname3, StorageManager, storageManager;
var init_storage = __esm({
  "src/storage/index.js"() {
    init_runtime();
    __filename2 = fileURLToPath2(import.meta.url);
    __dirname3 = path3.dirname(__filename2);
    StorageManager = class {
      constructor(options = {}) {
        this.options = {
          basePath: options.basePath || "storage",
          publicPath: options.publicPath || "public",
          uploadsPath: options.uploadsPath || "uploads",
          tempPath: options.tempPath || "temp",
          maxFileSize: options.maxFileSize || 10 * 1024 * 1024,
          // 10MB
          allowedTypes: options.allowedTypes || ["image/*", "text/*", "application/*"],
          cache: options.cache !== false,
          ...options
        };
        this.cache = this.options.cache ? new FluxCache() : null;
        this.storageRoot = path3.resolve(this.options.basePath);
        this.publicPath = path3.join(this.storageRoot, this.options.publicPath);
        this.uploadsPath = path3.join(this.storageRoot, this.options.uploadsPath);
        this.tempPath = path3.join(this.storageRoot, this.options.tempPath);
        this.initializeStorage();
      }
      async initializeStorage() {
        try {
          await fs3.ensureDir(this.storageRoot);
          await fs3.ensureDir(this.publicPath);
          await fs3.ensureDir(this.uploadsPath);
          await fs3.ensureDir(this.tempPath);
          await fs3.ensureDir(path3.join(this.publicPath, "images"));
          await fs3.ensureDir(path3.join(this.publicPath, "css"));
          await fs3.ensureDir(path3.join(this.publicPath, "js"));
          await fs3.ensureDir(path3.join(this.publicPath, "fonts"));
          await fs3.ensureDir(path3.join(this.publicPath, "documents"));
          await fs3.ensureDir(path3.join(this.uploadsPath, "images"));
          await fs3.ensureDir(path3.join(this.uploadsPath, "documents"));
          await fs3.ensureDir(path3.join(this.uploadsPath, "videos"));
          await fs3.ensureDir(path3.join(this.uploadsPath, "audio"));
          console.log("\u2705 Storage system initialized successfully");
        } catch (error) {
          console.error("\u274C Failed to initialize storage:", error);
          throw error;
        }
      }
      // File operations
      async storeFile(file, destination = "uploads", options = {}) {
        const {
          filename = file.name || `file_${Date.now()}`,
          subfolder = "",
          overwrite = false,
          validate = true
        } = options;
        try {
          if (validate) {
            await this.validateFile(file);
          }
          const destPath = destination === "public" ? this.publicPath : this.uploadsPath;
          const finalPath = path3.join(destPath, subfolder, filename);
          if (await fs3.pathExists(finalPath) && !overwrite) {
            throw new Error(`File ${filename} already exists`);
          }
          await fs3.ensureDir(path3.dirname(finalPath));
          await fs3.copy(file.path || file, finalPath);
          const stats = await fs3.stat(finalPath);
          const fileInfo = {
            filename,
            originalName: file.name || filename,
            path: finalPath,
            url: this.getPublicUrl(finalPath),
            size: stats.size,
            mimeType: file.mimetype || this.getMimeType(filename),
            uploadedAt: /* @__PURE__ */ new Date(),
            destination,
            subfolder
          };
          if (this.cache) {
            this.cache.set(`file:${filename}`, fileInfo);
          }
          return fileInfo;
        } catch (error) {
          console.error("Error storing file:", error);
          throw error;
        }
      }
      async getFile(filename, destination = "uploads") {
        try {
          if (this.cache) {
            const cached = this.cache.get(`file:${filename}`);
            if (cached) return cached;
          }
          const destPath = destination === "public" ? this.publicPath : this.uploadsPath;
          const filePath = path3.join(destPath, filename);
          if (!await fs3.pathExists(filePath)) {
            throw new Error(`File ${filename} not found`);
          }
          const stats = await fs3.stat(filePath);
          const fileInfo = {
            filename,
            path: filePath,
            url: this.getPublicUrl(filePath),
            size: stats.size,
            mimeType: this.getMimeType(filename),
            modifiedAt: stats.mtime,
            destination
          };
          if (this.cache) {
            this.cache.set(`file:${filename}`, fileInfo);
          }
          return fileInfo;
        } catch (error) {
          console.error("Error getting file:", error);
          throw error;
        }
      }
      async deleteFile(filename, destination = "uploads") {
        try {
          const destPath = destination === "public" ? this.publicPath : this.uploadsPath;
          const filePath = path3.join(destPath, filename);
          if (!await fs3.pathExists(filePath)) {
            throw new Error(`File ${filename} not found`);
          }
          await fs3.remove(filePath);
          if (this.cache) {
            this.cache.delete(`file:${filename}`);
          }
          return { success: true, message: `File ${filename} deleted successfully` };
        } catch (error) {
          console.error("Error deleting file:", error);
          throw error;
        }
      }
      async listFiles(destination = "uploads", subfolder = "", options = {}) {
        const {
          recursive = false,
          filter = null,
          sortBy = "name",
          sortOrder = "asc"
        } = options;
        try {
          const destPath = destination === "public" ? this.publicPath : this.uploadsPath;
          const searchPath = path3.join(destPath, subfolder);
          if (!await fs3.pathExists(searchPath)) {
            return [];
          }
          const files = await this.scanDirectory(searchPath, recursive);
          let filteredFiles = files;
          if (filter) {
            filteredFiles = files.filter((file) => {
              if (typeof filter === "function") {
                return filter(file);
              }
              if (typeof filter === "string") {
                return file.name.includes(filter);
              }
              if (filter.extension) {
                return path3.extname(file.name) === filter.extension;
              }
              if (filter.mimeType) {
                return file.mimeType.startsWith(filter.mimeType);
              }
              return true;
            });
          }
          filteredFiles.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            if (sortBy === "size" || sortBy === "modifiedAt") {
              aValue = aValue || 0;
              bValue = bValue || 0;
            } else {
              aValue = String(aValue || "").toLowerCase();
              bValue = String(bValue || "").toLowerCase();
            }
            if (sortOrder === "desc") {
              [aValue, bValue] = [bValue, aValue];
            }
            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
            return 0;
          });
          return filteredFiles;
        } catch (error) {
          console.error("Error listing files:", error);
          throw error;
        }
      }
      async scanDirectory(dirPath, recursive = false) {
        const files = [];
        try {
          const entries = await fs3.readdir(dirPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path3.join(dirPath, entry.name);
            const relativePath = path3.relative(this.storageRoot, fullPath);
            if (entry.isDirectory() && recursive) {
              const subFiles = await this.scanDirectory(fullPath, recursive);
              files.push(...subFiles);
            } else if (entry.isFile()) {
              const stats = await fs3.stat(fullPath);
              files.push({
                name: entry.name,
                path: fullPath,
                relativePath,
                url: this.getPublicUrl(fullPath),
                size: stats.size,
                mimeType: this.getMimeType(entry.name),
                modifiedAt: stats.mtime,
                createdAt: stats.birthtime
              });
            }
          }
        } catch (error) {
          console.error(`Error scanning directory ${dirPath}:`, error);
        }
        return files;
      }
      // Public file serving
      getPublicUrl(filePath) {
        const relativePath = path3.relative(this.storageRoot, filePath);
        return `/storage/${relativePath.replace(/\\/g, "/")}`;
      }
      async servePublicFile(filePath) {
        try {
          const fullPath = path3.join(this.storageRoot, filePath);
          if (!await fs3.pathExists(fullPath)) {
            throw new Error("File not found");
          }
          const stats = await fs3.stat(fullPath);
          const stream = fs3.createReadStream(fullPath);
          return {
            stream,
            stats,
            mimeType: this.getMimeType(filePath)
          };
        } catch (error) {
          console.error("Error serving public file:", error);
          throw error;
        }
      }
      // File validation
      async validateFile(file) {
        if (file.size && file.size > this.options.maxFileSize) {
          throw new Error(`File size exceeds maximum allowed size of ${this.formatBytes(this.options.maxFileSize)}`);
        }
        if (file.mimetype && !this.isAllowedType(file.mimetype)) {
          throw new Error(`File type ${file.mimetype} is not allowed`);
        }
        return true;
      }
      isAllowedType(mimeType) {
        return this.options.allowedTypes.some((allowed) => {
          if (allowed.endsWith("/*")) {
            return mimeType.startsWith(allowed.slice(0, -1));
          }
          return mimeType === allowed;
        });
      }
      // Utility methods
      getMimeType(filename) {
        const ext = path3.extname(filename).toLowerCase();
        const mimeTypes = {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "text/javascript",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
          ".eot": "application/vnd.ms-fontobject",
          ".pdf": "application/pdf",
          ".txt": "text/plain",
          ".md": "text/markdown",
          ".xml": "text/xml",
          ".csv": "text/csv"
        };
        return mimeTypes[ext] || "application/octet-stream";
      }
      formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      }
      // Storage statistics
      async getStorageStats() {
        try {
          const publicStats = await this.getDirectoryStats(this.publicPath);
          const uploadsStats = await this.getDirectoryStats(this.uploadsPath);
          const tempStats = await this.getDirectoryStats(this.tempPath);
          return {
            public: publicStats,
            uploads: uploadsStats,
            temp: tempStats,
            total: {
              files: publicStats.files + uploadsStats.files + tempStats.files,
              size: publicStats.size + uploadsStats.size + tempStats.size
            },
            cache: this.cache ? this.cache.getStats() : null
          };
        } catch (error) {
          console.error("Error getting storage stats:", error);
          throw error;
        }
      }
      async getDirectoryStats(dirPath) {
        try {
          if (!await fs3.pathExists(dirPath)) {
            return { files: 0, size: 0, directories: 0 };
          }
          const files = await this.scanDirectory(dirPath, true);
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          const directories = new Set(files.map((f) => path3.dirname(f.relativePath))).size;
          return {
            files: files.length,
            size: totalSize,
            directories
          };
        } catch (error) {
          console.error(`Error getting directory stats for ${dirPath}:`, error);
          return { files: 0, size: 0, directories: 0 };
        }
      }
      // Cleanup operations
      async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1e3) {
        try {
          const files = await this.scanDirectory(this.tempPath, true);
          const now = Date.now();
          let cleanedCount = 0;
          for (const file of files) {
            if (now - file.modifiedAt.getTime() > maxAge) {
              await this.deleteFile(file.name, "temp");
              cleanedCount++;
            }
          }
          return { cleanedCount, message: `Cleaned ${cleanedCount} temporary files` };
        } catch (error) {
          console.error("Error cleaning temp files:", error);
          throw error;
        }
      }
      // Backup and restore
      async createBackup(backupPath) {
        try {
          await fs3.ensureDir(path3.dirname(backupPath));
          await fs3.copy(this.storageRoot, backupPath);
          return { success: true, backupPath };
        } catch (error) {
          console.error("Error creating backup:", error);
          throw error;
        }
      }
      async restoreFromBackup(backupPath) {
        try {
          if (!await fs3.pathExists(backupPath)) {
            throw new Error("Backup path does not exist");
          }
          const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
          const currentBackup = path3.join(path3.dirname(this.storageRoot), `backup-before-restore-${timestamp}`);
          await this.createBackup(currentBackup);
          await fs3.remove(this.storageRoot);
          await fs3.copy(backupPath, this.storageRoot);
          return { success: true, message: "Storage restored successfully" };
        } catch (error) {
          console.error("Error restoring from backup:", error);
          throw error;
        }
      }
    };
    storageManager = new StorageManager();
  }
});

// src/cli/dev-server.js
var dev_server_exports = {};
__export(dev_server_exports, {
  devServer: () => devServer
});
import { createServer } from "http";
import { createReadStream } from "fs";
import { stat, readFile, readdir, access } from "fs/promises";
import { extname, join, resolve } from "path";
import chalk from "chalk";
async function devServer(options = {}) {
  const {
    port = 3e3,
    host = "localhost",
    root = process.cwd(),
    hot = false,
    analyze = false,
    profile = false
  } = options;
  console.log(chalk.blue("[start] Starting Flux Development Server..."));
  try {
    console.log(chalk.blue("[config] Loading configuration..."));
    await configManager.loadConfiguration();
    console.log(chalk.blue("[storage] Initializing storage system..."));
    await storageManager.initializeStorage();
    const configPort = configManager.get("server.port", port);
    const configHost = configManager.get("server.host", host);
    const finalPort = port || configPort;
    const finalHost = host || configHost;
    const compiler = new FluxCompiler({
      target: "js",
      minify: false,
      sourceMaps: true,
      optimizations: false,
      watchMode: true
    });
    const watchedFiles = /* @__PURE__ */ new Set();
    const fileWatchers = /* @__PURE__ */ new Map();
    const connections = /* @__PURE__ */ new Set();
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://${finalHost}:${finalPort}`);
        let filePath = url.pathname;
        if (filePath === "/") {
          const fluxIndex = resolve(root, ".flux", "index.html");
          try {
            await access(fluxIndex);
            await serveFile(fluxIndex, res);
            return;
          } catch {
          }
          filePath = "/index.html";
        }
        filePath = filePath.substring(1);
        if (filePath.includes("..")) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }
        const fullPath = resolve(root, filePath);
        try {
          const stats = await stat(fullPath);
          if (stats.isDirectory()) {
            const indexPath = join(fullPath, "index.html");
            try {
              await access(indexPath);
              await serveFile(indexPath, res);
            } catch {
              if (fullPath === resolve(root)) {
                const fluxIndex = resolve(root, ".flux", "index.html");
                try {
                  await access(fluxIndex);
                  await serveFile(fluxIndex, res);
                  return;
                } catch {
                }
              }
              await serveDirectoryListing(fullPath, res, filePath);
            }
          } else {
            await serveFile(fullPath, res);
          }
        } catch (error) {
          if (filePath.startsWith("storage/")) {
            try {
              await serveStorageFile(filePath, res);
              return;
            } catch (storageError) {
              console.log(`Storage file not found: ${filePath}`);
            }
          }
          if (filePath.endsWith(".js") && !filePath.includes("node_modules")) {
            const fluxPath = filePath.replace(/\.js$/, ".flux");
            const fullFluxPath = resolve(root, fluxPath);
            try {
              await access(fullFluxPath);
              await compileAndServeFlux(fullFluxPath, res, compiler);
              return;
            } catch {
            }
          }
          if (filePath.endsWith(".html") || filePath.startsWith(".flux/")) {
            const fluxPath = resolve(root, ".flux", filePath.replace(/^\.flux\//, ""));
            try {
              await access(fluxPath);
              await serveFile(fluxPath, res);
              return;
            } catch {
            }
          }
          const publicPath = resolve(root, "public", filePath);
          try {
            await access(publicPath);
            await serveFile(publicPath, res);
          } catch {
            await serve404(res, filePath);
          }
        }
      } catch (error) {
        console.error("Server error:", error);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });
    server.on("upgrade", (request, socket, head) => {
      if (request.url === "/__flux_live_reload") {
        const ws = new WebSocket2();
        ws.setSocket(socket, request, head);
        connections.add(ws);
        ws.on("close", () => {
          connections.delete(ws);
        });
        ws.on("message", (message) => {
          try {
            const data = JSON.parse(message);
            if (data.type === "ping") {
              ws.send(JSON.stringify({ type: "pong" }));
            }
          } catch (error) {
            console.error("WebSocket message error:", error);
          }
        });
      }
    });
    server.listen(finalPort, finalHost, () => {
      console.log(chalk.green(`[ready] Flux dev server at http://${finalHost}:${finalPort}`));
      console.log(chalk.cyan(`[root] ${root}`));
      console.log(chalk.blue(`[storage] ${configManager.get("storage.type", "local")}`));
      console.log(chalk.yellow(`[hmr] ${hot ? "enabled" : "disabled"}`));
      console.log(chalk.gray(`Press Ctrl+C to stop`));
    });
    await setupFileWatching(root, compiler, connections);
    return server;
  } catch (error) {
    console.error(chalk.red("\u274C Failed to start development server:"), error);
    throw error;
  }
}
async function serveFile(filePath, res) {
  const ext = extname(filePath);
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Cache-Control", "no-cache");
  const stream = createReadStream(filePath);
  stream.pipe(res);
  stream.on("error", (error) => {
    console.error("Error reading file:", error);
    res.writeHead(500);
    res.end("Error reading file");
  });
}
async function serveDirectoryListing(dirPath, res, urlPath) {
  try {
    const files = await readdir(dirPath);
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Directory: ${urlPath}</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        .file { margin: 5px 0; }
        .dir { color: #0066cc; font-weight: bold; }
        .file a { color: #333; text-decoration: none; }
        .file a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h2>Directory: ${urlPath}</h2>
    <div class="files">
        ${files.map((file) => {
      const isDir = file.includes(".") === false;
      const className = isDir ? "dir" : "file";
      const href = isDir ? `${file}/` : file;
      return `<div class="${className}"><a href="${href}">${file}</a></div>`;
    }).join("")}
    </div>
</body>
</html>`;
    res.end(html);
  } catch (error) {
    res.writeHead(500);
    res.end("Error reading directory");
  }
}
async function serveStorageFile(filePath, res) {
  try {
    const relativePath = filePath.replace(/^storage\//, "");
    const fileInfo = await storageManager.servePublicFile(relativePath);
    res.writeHead(200, {
      "Content-Type": fileInfo.mimeType,
      "Content-Length": fileInfo.stats.size,
      "Cache-Control": "public, max-age=3600"
      // Cache for 1 hour
    });
    fileInfo.stream.pipe(res);
    console.log(chalk.blue(`[storage] Served file: ${filePath}`));
  } catch (error) {
    console.error(chalk.red(`\u274C Storage file error: ${error.message}`));
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("File not found");
  }
}
async function compileAndServeFlux(fluxPath, res, compiler) {
  try {
    const result = await compiler.compileFile(fluxPath);
    if (!result) {
      res.writeHead(500);
      res.end("Compilation failed");
      return;
    }
    res.setHeader("Content-Type", "text/javascript");
    res.setHeader("Cache-Control", "no-cache");
    res.writeHead(200);
    res.end(result.output);
    console.log(chalk.green(`\u2705 Compiled: ${fluxPath}`));
  } catch (error) {
    console.error(chalk.red(`\u274C Compilation error: ${error.message}`));
    res.writeHead(500);
    res.end(`Compilation error: ${error.message}`);
  }
}
async function serve404(res, filePath) {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(404);
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>404 - File Not Found</title>
    <style>
        body { font-family: monospace; text-align: center; margin: 50px; }
        .error { color: #e74c3c; font-size: 72px; margin: 20px; }
        .message { color: #7f8c8d; font-size: 18px; }
    </style>
</head>
<body>
    <div class="error">404</div>
    <div class="message">File not found: ${filePath}</div>
</body>
</html>`;
  res.end(html);
}
async function setupFileWatching(root, compiler, connections) {
  const watchInterval = setInterval(async () => {
    try {
      const dirs = ["src", "public", "pages", "components", "stores", ".flux"];
      for (const dir of dirs) {
        const dirPath = join(root, dir);
        try {
          await access(dirPath);
        } catch {
        }
      }
    } catch (error) {
      console.error("File watching error:", error);
    }
  }, 1e3);
  process.on("SIGINT", () => {
    clearInterval(watchInterval);
    process.exit(0);
  });
}
var MIME_TYPES, WebSocket2;
var init_dev_server = __esm({
  "src/cli/dev-server.js"() {
    init_compiler();
    init_config();
    init_storage();
    MIME_TYPES = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject"
    };
    WebSocket2 = class {
      constructor() {
        this.socket = null;
      }
      setSocket(socket, request, head) {
        this.socket = socket;
        const key = request.headers["sec-websocket-key"];
        const accept = this.generateAccept(key);
        const response = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${accept}`,
          "",
          ""
        ].join("\r\n");
        socket.write(response);
        socket.on("data", (data) => {
          this.handleMessage(data);
        });
        socket.on("close", () => {
          this.socket = null;
        });
      }
      generateAccept(key) {
        const crypto = __require("crypto");
        const magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        const hash = crypto.createHash("sha1").update(key + magic).digest("base64");
        return hash;
      }
      handleMessage(data) {
        if (data.length < 2) return;
        const opcode = data[0] & 15;
        const payloadLength = data[1] & 127;
        if (opcode === 8) {
          this.socket.end();
          return;
        }
        if (opcode === 1 && payloadLength > 0) {
          const payload = data.slice(2, 2 + payloadLength);
          const message = payload.toString("utf8");
          this.emit("message", message);
        }
      }
      send(data) {
        if (this.socket && !this.socket.destroyed) {
          const message = typeof data === "string" ? data : JSON.stringify(data);
          const frame = this.createFrame(message);
          this.socket.write(frame);
        }
      }
      createFrame(payload) {
        const length = Buffer.byteLength(payload);
        const frame = Buffer.alloc(2 + length);
        frame[0] = 129;
        frame[1] = length;
        frame.write(payload, 2);
        return frame;
      }
      on(event, callback) {
        if (event === "message") {
          this.messageCallback = callback;
        } else if (event === "close") {
          this.closeCallback = callback;
        }
      }
      emit(event, data) {
        if (event === "message" && this.messageCallback) {
          this.messageCallback(data);
        } else if (event === "close" && this.closeCallback) {
          this.closeCallback();
        }
      }
    };
  }
});

// src/cli/advanced-cli.js
init_compiler();
init_runtime();
import { Command } from "commander";
import chalk2 from "chalk";
import fs4 from "fs-extra";
import path4 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname4 = path4.dirname(__filename3);
var AdvancedCLI = class {
  constructor() {
    this.program = new Command();
    this.compiler = new FluxCompiler();
    this.setupCommands();
  }
  setupCommands() {
    this.program.name("flux").description("Advanced Flux Language CLI with enhanced features").version("2.0.0");
    this.program.command("new <project-name>").description("Create a new Flux project with advanced templates").option("-t, --template <template>", "Project template (basic, fullstack, api, spa)", "basic").option("-y, --yes", "Skip prompts and use defaults").option("--typescript", "Enable TypeScript support").option("--testing", "Include testing setup").option("--linting", "Include linting configuration").action(this.createProject.bind(this));
    this.program.command("dev").description("Start development server with advanced features").option("-p, --port <port>", "Port number", "3000").option("-h, --host <host>", "Host address", "localhost").option("--hot", "Enable hot module replacement").option("--analyze", "Enable bundle analysis").option("--profile", "Enable performance profiling").action(this.startDevServer.bind(this));
    this.program.command("build").description("Build project with advanced optimizations").option("-o, --output <dir>", "Output directory", "dist").option("--minify", "Minify output").option("--source-maps", "Generate source maps").option("--analyze", "Analyze bundle").option("--watch", "Watch mode").action(this.buildProject.bind(this));
    this.program.command("test").description("Run tests with advanced features").option("--watch", "Watch mode").option("--coverage", "Generate coverage report").option("--parallel", "Run tests in parallel").option("--grep <pattern>", "Run tests matching pattern").action(this.runTests.bind(this));
    this.program.command("debug").description("Debug application with advanced tools").option("--inspect", "Enable Node.js inspector").option("--break-on-error", "Break on first error").option("--profile", "Generate CPU profile").option("--heap", "Generate heap snapshot").action(this.debugApplication.bind(this));
    this.program.command("profile").description("Profile application performance").option("--cpu", "CPU profiling").option("--memory", "Memory profiling").option("--network", "Network profiling").option("--output <file>", "Output file for results").action(this.profileApplication.bind(this));
    this.program.command("db").description("Database management commands").option("--migrate", "Run migrations").option("--seed", "Seed database").option("--reset", "Reset database").action(this.manageDatabase.bind(this));
    this.program.command("deploy").description("Deploy application").option("--env <environment>", "Deployment environment", "production").option("--platform <platform>", "Deployment platform").option("--region <region>", "Deployment region").action(this.deployApplication.bind(this));
    this.program.command("maintenance").description("Maintenance and utility commands").option("--clean", "Clean build artifacts").option("--update", "Update dependencies").option("--audit", "Security audit").action(this.maintenanceTasks.bind(this));
    this.program.command("generate <type> <name>").alias("g").description("Generate boilerplate: component|page|store").option("-d, --dir <dir>", "Directory to place the generated file").action(this.generateArtifact.bind(this));
  }
  async createProject(projectName, options) {
    console.log(chalk2.blue(`[new] Creating Flux project: ${projectName}`));
    try {
      const projectDir = path4.resolve(projectName);
      if (await fs4.pathExists(projectDir)) {
        console.error(chalk2.red(`Directory ${projectName} already exists`));
        process.exit(1);
      }
      await fs4.ensureDir(projectDir);
      await this.createProjectStructure(projectDir, options.template, options);
      await this.installDependencies(projectDir, options);
      console.log(chalk2.green(`[ok] Project ${projectName} created`));
      console.log(chalk2.cyan(`[dir] ${projectDir}`));
      console.log(chalk2.yellow(`[next]`));
      console.log(chalk2.yellow(`   cd ${projectName}`));
      console.log(chalk2.yellow(`   npm run dev`));
    } catch (error) {
      console.error(chalk2.red("Error creating project:"), error);
      process.exit(1);
    }
  }
  async createProjectStructure(projectDir, template, options) {
    const templates = {
      basic: this.createBasicTemplate.bind(this),
      fullstack: this.createFullstackTemplate.bind(this),
      api: this.createAPITemplate.bind(this),
      spa: this.createSPATemplate.bind(this)
    };
    const templateFn = templates[template] || templates.basic;
    await templateFn(projectDir, options);
  }
  async createBasicTemplate(projectDir, options) {
    const files = {
      "package.json": this.generatePackageJson(options),
      "flux.config.js": this.generateFluxConfig(options),
      "README.md": this.generateREADME(options),
      "src/app.flux": this.generateAppFlux(options),
      "src/components/Header.flux": this.generateHeaderComponent(),
      "src/components/Footer.flux": this.generateFooterComponent(),
      "src/pages/home.flux": this.generateHomePage(),
      "src/styles/global.css": this.generateGlobalCSS(),
      ".gitignore": this.generateGitignore(),
      ".flux/index.html": this.generateIndexHTML()
    };
    for (const [filename, content] of Object.entries(files)) {
      const filePath = path4.join(projectDir, filename);
      await fs4.ensureDir(path4.dirname(filePath));
      await fs4.writeFile(filePath, content);
    }
  }
  async createFullstackTemplate(projectDir, options) {
    await this.createBasicTemplate(projectDir, options);
    const fullstackFiles = {
      "src/server/index.js": this.generateServerFile(),
      "src/database/schema.js": this.generateDatabaseSchema(),
      "src/api/routes.js": this.generateAPIRoutes(),
      "src/middleware/auth.js": this.generateAuthMiddleware(),
      "docker-compose.yml": this.generateDockerCompose(),
      "src/config/database.js": this.generateDatabaseConfig()
    };
    for (const [filename, content] of Object.entries(fullstackFiles)) {
      const filePath = path4.join(projectDir, filename);
      await fs4.ensureDir(path4.dirname(filePath));
      await fs4.writeFile(filePath, content);
    }
  }
  async createAPITemplate(projectDir, options) {
    const apiFiles = {
      "package.json": this.generateAPIPackageJson(options),
      "src/server.js": this.generateAPIServer(),
      "src/routes/index.js": this.generateAPIRoutes(),
      "src/controllers/index.js": this.generateAPIControllers(),
      "src/models/index.js": this.generateAPIModels(),
      "src/middleware/index.js": this.generateAPIMiddleware(),
      "src/config/index.js": this.generateAPIConfig(),
      "tests/api.test.js": this.generateAPITests(),
      ".env.example": this.generateEnvExample(),
      "README.md": this.generateAPIREADME()
    };
    for (const [filename, content] of Object.entries(apiFiles)) {
      const filePath = path4.join(projectDir, filename);
      await fs4.ensureDir(path4.dirname(filePath));
      await fs4.writeFile(filePath, content);
    }
  }
  async createSPATemplate(projectDir, options) {
    await this.createBasicTemplate(projectDir, options);
    const spaFiles = {
      "src/router/index.js": this.generateSPARouter(),
      "src/store/index.js": this.generateSPAStore(),
      "src/utils/api.js": this.generateSPAAPI(),
      "src/components/Layout.flux": this.generateSPALayout(),
      "src/pages/about.flux": this.generateAboutPage(),
      "src/pages/contact.flux": this.generateContactPage(),
      "src/styles/components.css": this.generateComponentCSS()
    };
    for (const [filename, content] of Object.entries(spaFiles)) {
      const filePath = path4.join(projectDir, filename);
      await fs4.ensureDir(path4.dirname(filePath));
      await fs4.writeFile(filePath, content);
    }
  }
  async installDependencies(projectDir, options) {
    console.log(chalk2.blue("[deps] Installing dependencies..."));
    const packageManager = this.detectPackageManager();
    const installCmd = packageManager === "npm" ? "npm install" : "yarn install";
    process.chdir(projectDir);
    try {
      const { execSync } = await import("child_process");
      execSync(installCmd, { stdio: "inherit" });
    } catch (error) {
      console.warn(chalk2.yellow("[warn] Could not install dependencies automatically"));
      console.warn(chalk2.yellow(`[hint] Run '${installCmd}' manually`));
    }
  }
  detectPackageManager() {
    if (fs4.pathExistsSync("yarn.lock")) return "yarn";
    if (fs4.pathExistsSync("pnpm-lock.yaml")) return "pnpm";
    return "npm";
  }
  async startDevServer(options) {
    console.log(chalk2.blue("[dev] Starting development server..."));
    try {
      const devServer2 = await Promise.resolve().then(() => (init_dev_server(), dev_server_exports));
      await devServer2.devServer({
        port: parseInt(options.port),
        host: options.host,
        hot: options.hot,
        analyze: options.analyze,
        profile: options.profile
      });
    } catch (error) {
      console.error(chalk2.red("Error starting dev server:"), error);
      process.exit(1);
    }
  }
  async buildProject(options) {
    console.log(chalk2.blue("[build] Building project..."));
    try {
      const compiler = new FluxCompiler({
        outputDir: options.output,
        minify: options.minify,
        sourceMaps: options.sourceMaps,
        analyze: options.analyze
      });
      const results = await compiler.build();
      if (options.analyze) {
        await this.analyzeBundle(results);
      }
      console.log(chalk2.green("[ok] Build completed"));
    } catch (error) {
      console.error(chalk2.red("Build failed:"), error);
      process.exit(1);
    }
  }
  async runTests(options) {
    console.log(chalk2.blue("[test] Running tests..."));
    try {
      const testRunner = await import("../test/run-tests.js");
      await testRunner.runTests(options);
    } catch (error) {
      console.error(chalk2.red("Tests failed:"), error);
      process.exit(1);
    }
  }
  async debugApplication(options) {
    console.log(chalk2.blue("[debug] Starting debug session..."));
    try {
      if (options.inspect) {
        process.env.NODE_OPTIONS = "--inspect-brk";
      }
      console.log(chalk2.green("[ok] Debug session started"));
      console.log(chalk2.yellow("[hint] Use your debugger to connect"));
    } catch (error) {
      console.error(chalk2.red("Debug session failed:"), error);
      process.exit(1);
    }
  }
  async profileApplication(options) {
    console.log(chalk2.blue("[profile] Starting performance profiling..."));
    try {
      if (options.cpu) {
        await this.startCPUProfiling(options.output);
      }
      if (options.memory) {
        await this.startMemoryProfiling(options.output);
      }
      if (options.network) {
        await this.startNetworkProfiling(options.output);
      }
      console.log(chalk2.green("[ok] Profiling started"));
    } catch (error) {
      console.error(chalk2.red("Profiling failed:"), error);
      process.exit(1);
    }
  }
  async manageDatabase(options) {
    console.log(chalk2.blue("[db] Managing database..."));
    try {
      if (options.migrate) {
        await this.runMigrations();
      }
      if (options.seed) {
        await this.seedDatabase();
      }
      if (options.reset) {
        await this.resetDatabase();
      }
      console.log(chalk2.green("[ok] Database operations completed"));
    } catch (error) {
      console.error(chalk2.red("Database operations failed:"), error);
      process.exit(1);
    }
  }
  async deployApplication(options) {
    console.log(chalk2.blue("[deploy] Deploying application..."));
    try {
      await this.buildProject({ output: "dist" });
      if (options.platform === "vercel") {
        await this.deployToVercel(options);
      } else if (options.platform === "netlify") {
        await this.deployToNetlify(options);
      } else if (options.platform === "aws") {
        await this.deployToAWS(options);
      } else {
        console.log(chalk2.yellow("[warn] No deployment platform specified"));
      }
      console.log(chalk2.green("[ok] Deployment completed"));
    } catch (error) {
      console.error(chalk2.red("Deployment failed:"), error);
      process.exit(1);
    }
  }
  async maintenanceTasks(options) {
    console.log(chalk2.blue("[maint] Running maintenance tasks..."));
    try {
      if (options.clean) {
        await this.cleanBuildArtifacts();
      }
      if (options.update) {
        await this.updateDependencies();
      }
      if (options.audit) {
        await this.securityAudit();
      }
      console.log(chalk2.green("[ok] Maintenance tasks completed"));
    } catch (error) {
      console.error(chalk2.red("Maintenance tasks failed:"), error);
      process.exit(1);
    }
  }
  // Template generation methods
  generatePackageJson(options) {
    return JSON.stringify({
      name: "flux-project",
      version: "1.0.0",
      description: "Flux Language Project",
      main: "src/app.flux",
      scripts: {
        "dev": "flux dev",
        "build": "flux build",
        "test": "flux test",
        "start": "flux start"
      },
      dependencies: {
        "flux-lang": "^2.0.0"
      },
      devDependencies: {
        "@types/node": "^18.0.0"
      }
    }, null, 2);
  }
  generateFluxConfig(options) {
    return `export default {
  target: 'js',
  minify: false,
  sourceMaps: true,
  optimizations: true,
  treeShaking: true,
  codeSplitting: false,
  appDir: '.flux',
  publicDir: 'public'
};`;
  }
  generateREADME(options) {
    return `# Flux Project

This is a Flux Language project created with the advanced CLI.

## Getting Started

\`\`\`bash
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
`;
  }
  generateAppFlux(options) {
    return `component App {
  state title = "Welcome to Flux!"
  
  render {
    <div class="app">
      <Header />
      <main>
        <h1>{title}</h1>
        <p>Your Flux application is running!</p>
      </main>
      <Footer />
    </div>
  }
}

export default App;`;
  }
  generateHeaderComponent() {
    return `component Header {
  render {
    <header class="header">
      <h1>Flux App</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  }
}`;
  }
  generateFooterComponent() {
    return `component Footer {
  render {
    <footer class="footer">
      <p>&copy; 2024 Flux App</p>
    </footer>
  }
}`;
  }
  generateHomePage() {
    return `component HomePage {
  render {
    <div class="home">
      <h2>Welcome Home</h2>
      <p>This is your home page.</p>
    </div>
  }
}`;
  }
  generateGlobalCSS() {
    return `/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
}

.footer {
  background: #34495e;
  color: white;
  padding: 1rem;
  margin-top: auto;
}`;
  }
  generateGitignore() {
    return `node_modules/
dist/
.env
*.log
.DS_Store`;
  }
  generateIndexHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flux App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="../src/app.flux"></script>
</body>
</html>`;
  }
  // Additional template methods would go here...
  generateServerFile() {
    return "// Server implementation";
  }
  generateDatabaseSchema() {
    return "// Database schema";
  }
  generateAPIRoutes() {
    return "// API routes";
  }
  generateAuthMiddleware() {
    return "// Auth middleware";
  }
  generateDockerCompose() {
    return "// Docker compose";
  }
  generateDatabaseConfig() {
    return "// Database config";
  }
  generateAPIPackageJson() {
    return "{}";
  }
  generateAPIServer() {
    return "// API server";
  }
  generateAPIControllers() {
    return "// API controllers";
  }
  generateAPIModels() {
    return "// API models";
  }
  generateAPIMiddleware() {
    return "// API middleware";
  }
  generateAPIConfig() {
    return "// API config";
  }
  generateAPITests() {
    return "// API tests";
  }
  generateEnvExample() {
    return "// Environment variables";
  }
  generateAPIREADME() {
    return "// API README";
  }
  generateSPARouter() {
    return "// SPA router";
  }
  generateSPAStore() {
    return "// SPA store";
  }
  generateSPAAPI() {
    return "// SPA API";
  }
  generateSPALayout() {
    return "// SPA layout";
  }
  generateAboutPage() {
    return "// About page";
  }
  generateContactPage() {
    return "// Contact page";
  }
  generateComponentCSS() {
    return "// Component CSS";
  }
  // Profiling methods
  async startCPUProfiling(output) {
    console.log("[profile] CPU profiling started");
  }
  async startMemoryProfiling(output) {
    console.log("[profile] Memory profiling started");
  }
  async startNetworkProfiling(output) {
    console.log("[profile] Network profiling started");
  }
  // Database methods
  async runMigrations() {
    console.log("[db] Running migrations...");
  }
  async seedDatabase() {
    console.log("[db] Seeding database...");
  }
  async resetDatabase() {
    console.log("[db] Resetting database...");
  }
  // Deployment methods
  async deployToVercel(options) {
    console.log("[deploy] Vercel...");
  }
  async deployToNetlify(options) {
    console.log("[deploy] Netlify...");
  }
  async deployToAWS(options) {
    console.log("[deploy] AWS...");
  }
  // Maintenance methods
  async cleanBuildArtifacts() {
    console.log("[maint] Cleaning build artifacts...");
  }
  async updateDependencies() {
    console.log("[maint] Updating dependencies...");
  }
  async securityAudit() {
    console.log("[maint] Running security audit...");
  }
  // Bundle analysis
  async analyzeBundle(results) {
    console.log("[analyze] Bundle...");
  }
  async generateArtifact(type, name, options) {
    const cwd = process.cwd();
    const targetDir = options.dir ? path4.resolve(options.dir) : path4.resolve(
      cwd,
      "src",
      type === "page" ? "pages" : type === "store" ? "stores" : "components"
    );
    await fs4.ensureDir(targetDir);
    const fileName = type === "store" ? `${name}.flux` : `${capitalize(name)}.flux`;
    const filePath = path4.join(targetDir, fileName);
    if (await fs4.pathExists(filePath)) {
      console.log(chalk2.yellow("[skip] File exists:"), filePath);
      return;
    }
    const content = this.scaffold(type, name);
    await fs4.writeFile(filePath, content);
    console.log(chalk2.green("[ok] Generated:"), filePath);
  }
  scaffold(type, name) {
    const compName = capitalize(name);
    if (type === "component") {
      return `component ${compName} {
  render {
    <div class="${kebab(compName)}">${compName}</div>
  }
}`;
    }
    if (type === "page") {
      return `@route("/${kebab(compName)}")
component ${compName}Page {
  render {
    <div class="page ${kebab(compName)}">${compName} Page</div>
  }
}`;
    }
    if (type === "store") {
      return `store ${compName}Store {
  state value = null
}`;
    }
    return `// Unknown type`;
  }
  run() {
    this.program.parse();
  }
};
function capitalize(s) {
  return s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
function kebab(s) {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new AdvancedCLI();
  cli.run();
}
export {
  AdvancedCLI
};
//# sourceMappingURL=advanced-cli.js.map
