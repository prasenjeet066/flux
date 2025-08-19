// src/compiler/lexer.js
var FluxLexer = class _FluxLexer {
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
    ON: "ON",
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
    // Arrow function
    ARROW: "ARROW",
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
    "on": "ON",
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
        if (this.match("=")) {
          this.addToken(_FluxLexer.TOKEN_TYPES.EQUALS);
        } else if (this.match(">")) {
          this.addToken(_FluxLexer.TOKEN_TYPES.ARROW);
        } else {
          this.addToken(_FluxLexer.TOKEN_TYPES.ASSIGN);
        }
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

// src/ast/nodes.js
var ASTNode = class {
  constructor(type, location) {
    this.type = type;
    this.location = location;
  }
};
var Program = class extends ASTNode {
  constructor(body, location) {
    super("Program", location);
    this.body = body;
  }
};
var ImportDeclaration = class extends ASTNode {
  constructor(specifiers, source, location) {
    super("ImportDeclaration", location);
    this.specifiers = specifiers;
    this.source = source;
  }
};
var ImportSpecifier = class extends ASTNode {
  constructor(imported, local, location) {
    super("ImportSpecifier", location);
    this.imported = imported;
    this.local = local;
  }
};
var ExportDeclaration = class extends ASTNode {
  constructor(declaration, location) {
    super("ExportDeclaration", location);
    this.declaration = declaration;
  }
};
var ComponentDeclaration = class extends ASTNode {
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
var StoreDeclaration = class extends ASTNode {
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
var StateDeclaration = class extends ASTNode {
  constructor(name, initialValue, typeAnnotation, location) {
    super("StateDeclaration", location);
    this.name = name;
    this.initialValue = initialValue;
    this.typeAnnotation = typeAnnotation;
  }
};
var PropDeclaration = class extends ASTNode {
  constructor(name, typeAnnotation, defaultValue, location) {
    super("PropDeclaration", location);
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.defaultValue = defaultValue;
  }
};
var MethodDeclaration = class extends ASTNode {
  constructor(name, parameters, body, isAsync, location) {
    super("MethodDeclaration", location);
    this.name = name;
    this.parameters = parameters;
    this.body = body;
    this.isAsync = isAsync;
  }
};
var ActionDeclaration = class extends ASTNode {
  constructor(name, parameters, body, isAsync, location) {
    super("ActionDeclaration", location);
    this.name = name;
    this.parameters = parameters;
    this.body = body;
    this.isAsync = isAsync;
  }
};
var EffectDeclaration = class extends ASTNode {
  constructor(dependencies, body, location) {
    super("EffectDeclaration", location);
    this.dependencies = dependencies;
    this.body = body;
  }
};
var ComputedDeclaration = class extends ASTNode {
  constructor(name, body, location) {
    super("ComputedDeclaration", location);
    this.name = name;
    this.body = body;
  }
};
var RenderDeclaration = class extends ASTNode {
  constructor(body, location) {
    super("RenderDeclaration", location);
    this.body = body;
  }
};
var LifecycleDeclaration = class extends ASTNode {
  constructor(phase, body, isAsync, location) {
    super("LifecycleDeclaration", location);
    this.phase = phase;
    this.body = body;
    this.isAsync = isAsync;
  }
};
var Decorator = class extends ASTNode {
  constructor(name, arguments_, location) {
    super("Decorator", location);
    this.name = name;
    this.arguments = arguments_ || [];
  }
};
var BinaryExpression = class extends ASTNode {
  constructor(left, operator, right, location) {
    super("BinaryExpression", location);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
};
var UnaryExpression = class extends ASTNode {
  constructor(operator, operand, location) {
    super("UnaryExpression", location);
    this.operator = operator;
    this.operand = operand;
  }
};
var AssignmentExpression = class extends ASTNode {
  constructor(left, operator, right, location) {
    super("AssignmentExpression", location);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
};
var CallExpression = class extends ASTNode {
  constructor(callee, arguments_, location) {
    super("CallExpression", location);
    this.callee = callee;
    this.arguments = arguments_;
  }
};
var MemberExpression = class extends ASTNode {
  constructor(object, property, computed, location) {
    super("MemberExpression", location);
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
};
var ConditionalExpression = class extends ASTNode {
  constructor(test, consequent, alternate, location) {
    super("ConditionalExpression", location);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
};
var ArrayExpression = class extends ASTNode {
  constructor(elements, location) {
    super("ArrayExpression", location);
    this.elements = elements;
  }
};
var ObjectExpression = class extends ASTNode {
  constructor(properties, location) {
    super("ObjectExpression", location);
    this.properties = properties;
  }
};
var Property = class extends ASTNode {
  constructor(key, value, kind, location) {
    super("Property", location);
    this.key = key;
    this.value = value;
    this.kind = kind || "init";
  }
};
var Literal = class extends ASTNode {
  constructor(value, location) {
    super("Literal", location);
    this.value = value;
  }
};
var Identifier = class extends ASTNode {
  constructor(name, location) {
    super("Identifier", location);
    this.name = name;
  }
};
var JSXElement = class extends ASTNode {
  constructor(openingElement, children, closingElement, location) {
    super("JSXElement", location);
    this.openingElement = openingElement;
    this.children = children;
    this.closingElement = closingElement;
    this.selfClosing = !closingElement;
  }
};
var JSXOpeningElement = class extends ASTNode {
  constructor(name, attributes, selfClosing, location) {
    super("JSXOpeningElement", location);
    this.name = name;
    this.attributes = attributes;
    this.selfClosing = selfClosing;
  }
};
var JSXClosingElement = class extends ASTNode {
  constructor(name, location) {
    super("JSXClosingElement", location);
    this.name = name;
  }
};
var JSXAttribute = class extends ASTNode {
  constructor(name, value, location) {
    super("JSXAttribute", location);
    this.name = name;
    this.value = value;
  }
};
var JSXExpressionContainer = class extends ASTNode {
  constructor(expression, location) {
    super("JSXExpressionContainer", location);
    this.expression = expression;
  }
};
var JSXText = class extends ASTNode {
  constructor(value, location) {
    super("JSXText", location);
    this.value = value;
  }
};
var ExpressionStatement = class extends ASTNode {
  constructor(expression, location) {
    super("ExpressionStatement", location);
    this.expression = expression;
  }
};
var BlockStatement = class extends ASTNode {
  constructor(body, location) {
    super("BlockStatement", location);
    this.body = body;
  }
};
var IfStatement = class extends ASTNode {
  constructor(test, consequent, alternate, location) {
    super("IfStatement", location);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
};
var WhileStatement = class extends ASTNode {
  constructor(test, body, location) {
    super("WhileStatement", location);
    this.test = test;
    this.body = body;
  }
};
var ForStatement = class extends ASTNode {
  constructor(init, test, update, body, location) {
    super("ForStatement", location);
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
};
var ReturnStatement = class extends ASTNode {
  constructor(argument, location) {
    super("ReturnStatement", location);
    this.argument = argument;
  }
};
var TryStatement = class extends ASTNode {
  constructor(block, handler, finalizer, location) {
    super("TryStatement", location);
    this.block = block;
    this.handler = handler;
    this.finalizer = finalizer;
  }
};
var CatchClause = class extends ASTNode {
  constructor(param, body, location) {
    super("CatchClause", location);
    this.param = param;
    this.body = body;
  }
};
var GuardDeclaration = class extends ASTNode {
  constructor(name, parameters, body, location) {
    super("GuardDeclaration", location);
    this.name = name;
    this.parameters = parameters;
    this.body = body;
  }
};
var TSStringKeyword = class extends ASTNode {
  constructor(location) {
    super("TSStringKeyword", location);
  }
};
var TSNumberKeyword = class extends ASTNode {
  constructor(location) {
    super("TSNumberKeyword", location);
  }
};
var TSBooleanKeyword = class extends ASTNode {
  constructor(location) {
    super("TSBooleanKeyword", location);
  }
};
var ArrowFunctionExpression = class extends ASTNode {
  constructor(params, body, location) {
    super("ArrowFunctionExpression", location);
    this.params = params;
    this.body = body;
  }
};
function createLocation(startLine, startColumn, endLine, endColumn) {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };
}

// src/compiler/parser.js
var FluxParser = class _FluxParser {
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
    const dependencies = [];
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
      } else if (this.match("ARROW")) {
        const params = [];
        if (this.check("LEFT_PAREN")) {
          this.advance();
          if (!this.check("RIGHT_PAREN")) {
            do {
              params.push(this.consume("IDENTIFIER", "Expected parameter name"));
            } while (this.match("COMMA"));
          }
          this.consume("RIGHT_PAREN", 'Expected ")" after parameters');
        } else {
          params.push(this.consume("IDENTIFIER", "Expected parameter name"));
        }
        let body;
        if (this.check("LEFT_BRACE")) {
          body = this.blockStatement();
        } else {
          body = this.expression();
        }
        expr = new ArrowFunctionExpression(
          params.map((p) => new Identifier(p.lexeme)),
          body,
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
      name = new Identifier(`@${eventName.lexeme}`);
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

// src/compiler/codegen.js
var FluxCodeGenerator = class {
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
    this.addLine("import { FluxRuntime, Component, Store, createReactiveState, createEffect, createComputed, createComponent, createStore } from '../runtime/index.js';");
    this.addLine("import { createElement, Fragment } from '../runtime/index.js';");
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
    if (node.props.length > 0) {
      this.addLine("// Initialize props");
      for (const propDecl of node.props) {
        const name = propDecl.name.name;
        const defaultValue = propDecl.defaultValue ? this.visit(propDecl.defaultValue) : "undefined";
        this.addLine(`this.${name} = props.${name} !== undefined ? props.${name} : ${defaultValue};`);
      }
      this.addLine("");
    }
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
      const path2 = routeDecorator.arguments[0];
      this.addLine(`FluxRuntime.registerRoute(${this.visit(path2)}, ${componentName});`);
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
        let attrName = attr.name && attr.name.name ? attr.name.name : "unknown";
        if (attrName.startsWith("@")) {
          const eventName = attrName.substring(1);
          attrName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
        }
        this.add(`${attrName}: `);
        if (attr.value && attr.value.type === "JSXExpressionContainer") {
          this.visit(attr.value.expression);
        } else if (attr.value) {
          this.visit(attr.value);
        } else {
          this.add("true");
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
  visitArrowFunctionExpression(node) {
    if (node.params.length === 1 && node.params[0].type === "Identifier") {
      this.visit(node.params[0]);
    } else {
      this.add("(");
      for (let i = 0; i < node.params.length; i++) {
        this.visit(node.params[i]);
        if (i < node.params.length - 1) {
          this.add(", ");
        }
      }
      this.add(")");
    }
    this.add(" => ");
    if (node.body.type === "BlockStatement") {
      this.visit(node.body);
    } else {
      this.visit(node.body);
    }
  }
  visitFunctionExpression(node) {
    this.add("function");
    if (node.id) {
      this.add(" ");
      this.visit(node.id);
    }
    this.add("(");
    for (let i = 0; i < node.params.length; i++) {
      this.visit(node.params[i]);
      if (i < node.params.length - 1) {
        this.add(", ");
      }
    }
    this.add(") ");
    this.visit(node.body);
  }
  visitLogicalExpression(node) {
    this.visit(node.left);
    this.add(` ${node.operator} `);
    this.visit(node.right);
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
    this.output.push(`${text}
`);
  }
  getIndent() {
    return "  ".repeat(this.indent);
  }
};

// src/errors.js
var FluxError = class extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "FluxError";
    this.details = details;
    this.timestamp = /* @__PURE__ */ new Date();
  }
};

// src/compiler/index.js
import fs from "fs-extra";
import path from "path";
var FluxCompiler = class {
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
    this.optimizer = this.createOptimizer();
    this.bundler = this.createBundler();
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
        sourceMap: generator.sourceMap || null,
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
  createOptimizer() {
    return {
      optimize: (ast) => ast,
      // Placeholder optimization
      getOptimizations: () => []
    };
  }
  createBundler() {
    return {
      bundle: (files) => ({ code: "", map: null }),
      // Placeholder bundling
      getBundleInfo: () => ({ size: 0, files: [] })
    };
  }
};
var FluxBundler = class {
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
export {
  FluxBundler,
  FluxCompiler
};
//# sourceMappingURL=index.js.map
