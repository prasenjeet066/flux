// flux-core/src/compiler/lexer.js
// Tokenizes Flux source code into tokens

export class FluxLexer {
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
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    
    // Keywords
    COMPONENT: 'COMPONENT',
    STATE: 'STATE',
    PROP: 'PROP',
    METHOD: 'METHOD',
    RENDER: 'RENDER',
    EFFECT: 'EFFECT',
    COMPUTED: 'COMPUTED',
    STORE: 'STORE',
    ACTION: 'ACTION',
    LIFECYCLE: 'LIFECYCLE',
    GUARD: 'GUARD',
    ROUTER: 'ROUTER',
    ROUTE: 'ROUTE',
    USE: 'USE',
    ON: 'ON',
    IMPORT: 'IMPORT',
    EXPORT: 'EXPORT',
    ASYNC: 'ASYNC',
    AWAIT: 'AWAIT',
    IF: 'IF',
    ELSE: 'ELSE',
    FOR: 'FOR',
    WHILE: 'WHILE',
    RETURN: 'RETURN',
    TRY: 'TRY',
    CATCH: 'CATCH',
    FINALLY: 'FINALLY',
    ARROW: 'ARROW',
    MAP: 'MAP',
    FILTER: 'FILTER',
    REDUCE: 'REDUCE',
    FIND: 'FIND',
    FOREACH: 'FOREACH',
    INCLUDES: 'INCLUDES',
    INDEXOF: 'INDEXOF',
    SLICE: 'SLICE',
    SPLICE: 'SPLICE',
    PUSH: 'PUSH',
    POP: 'POP',
    SHIFT: 'SHIFT',
    UNSHIFT: 'UNSHIFT',
    SORT: 'SORT',
    REVERSE: 'REVERSE',
    JOIN: 'JOIN',
    SPLIT: 'SPLIT',
    CONCAT: 'CONCAT',
    
    // Operators
    ASSIGN: 'ASSIGN',
    PLUS_ASSIGN: 'PLUS_ASSIGN',
    MINUS_ASSIGN: 'MINUS_ASSIGN',
    MULTIPLY_ASSIGN: 'MULTIPLY_ASSIGN',
    DIVIDE_ASSIGN: 'DIVIDE_ASSIGN',
    MODULO_ASSIGN: 'MODULO_ASSIGN',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MULTIPLY: 'MULTIPLY',
    DIVIDE: 'DIVIDE',
    MODULO: 'MODULO',
    EQUALS: 'EQUALS',
    NOT_EQUALS: 'NOT_EQUALS',
    LESS_THAN: 'LESS_THAN',
    GREATER_THAN: 'GREATER_THAN',
    LESS_EQUAL: 'LESS_EQUAL',
    GREATER_EQUAL: 'GREATER_EQUAL',
    LOGICAL_AND: 'LOGICAL_AND',
    LOGICAL_OR: 'LOGICAL_OR',
    LOGICAL_NOT: 'LOGICAL_NOT',
    
    // Delimiters
    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGHT_PAREN',
    LEFT_BRACE: 'LEFT_BRACE',
    RIGHT_BRACE: 'RIGHT_BRACE',
    LEFT_BRACKET: 'LEFT_BRACKET',
    RIGHT_BRACKET: 'RIGHT_BRACKET',
    SEMICOLON: 'SEMICOLON',
    COMMA: 'COMMA',
    DOT: 'DOT',
    COLON: 'COLON',
    QUESTION: 'QUESTION',
    
    // JSX-like tokens
    JSX_OPEN: 'JSX_OPEN',
    JSX_CLOSE: 'JSX_CLOSE',
    JSX_SELF_CLOSE: 'JSX_SELF_CLOSE',
    JSX_TEXT: 'JSX_TEXT',
    
    // Decorators
    AT: 'AT',
    
    // Special
    NEWLINE: 'NEWLINE',
    EOF: 'EOF',
    UNKNOWN: 'UNKNOWN'
  };

  static KEYWORDS = {
    'component': 'COMPONENT',
    'state': 'STATE',
    'prop': 'PROP',
    'method': 'METHOD',
    'render': 'RENDER',
    'effect': 'EFFECT',
    'computed': 'COMPUTED',
    'store': 'STORE',
    'action': 'ACTION',
    'lifecycle': 'LIFECYCLE',
    'guard': 'GUARD',
    'router': 'ROUTER',
    'route': 'ROUTE',
    'use': 'USE',
    'on': 'ON',
    'import': 'IMPORT',
    'export': 'EXPORT',
    'async': 'ASYNC',
    'await': 'AWAIT',
    'if': 'IF',
    'else': 'ELSE',
    'for': 'FOR',
    'while': 'WHILE',
    'return': 'RETURN',
    'try': 'TRY',
    'catch': 'CATCH',
    'finally': 'FINALLY',
    'true': 'BOOLEAN',
    'false': 'BOOLEAN',
    'null': 'BOOLEAN',
    'undefined': 'BOOLEAN',
    'map': 'MAP',
    'filter': 'FILTER',
    'reduce': 'REDUCE',
    'find': 'FIND',
    'forEach': 'FOREACH',
    'includes': 'INCLUDES',
    'indexOf': 'INDEXOF',
    'slice': 'SLICE',
    'splice': 'SPLICE',
    'push': 'PUSH',
    'pop': 'POP',
    'shift': 'SHIFT',
    'unshift': 'UNSHIFT',
    'sort': 'SORT',
    'reverse': 'REVERSE',
    'join': 'JOIN',
    'split': 'SPLIT',
    'concat': 'CONCAT'
  };

  tokenize() {
    while (!this.isAtEnd()) {
      this.scanToken();
    }
    
    this.addToken(FluxLexer.TOKEN_TYPES.EOF);
    return this.tokens;
  }

  scanToken() {
    this.start = this.position;
    const c = this.advance();
    
    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        break; // Ignore whitespace
      
      case '\n':
        this.line++;
        this.column = 1;
        this.addToken(FluxLexer.TOKEN_TYPES.NEWLINE);
        break;
      
      case '(':
        this.addToken(FluxLexer.TOKEN_TYPES.LEFT_PAREN);
        break;
      case ')':
        this.addToken(FluxLexer.TOKEN_TYPES.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(FluxLexer.TOKEN_TYPES.LEFT_BRACE);
        break;
      case '}':
        this.addToken(FluxLexer.TOKEN_TYPES.RIGHT_BRACE);
        break;
      case '[':
        this.addToken(FluxLexer.TOKEN_TYPES.LEFT_BRACKET);
        break;
      case ']':
        this.addToken(FluxLexer.TOKEN_TYPES.RIGHT_BRACKET);
        break;
      case ';':
        this.addToken(FluxLexer.TOKEN_TYPES.SEMICOLON);
        break;
      case ',':
        this.addToken(FluxLexer.TOKEN_TYPES.COMMA);
        break;
      case '.':
        this.addToken(FluxLexer.TOKEN_TYPES.DOT);
        break;
      case ':':
        this.addToken(FluxLexer.TOKEN_TYPES.COLON);
        break;
      case '?':
        this.addToken(FluxLexer.TOKEN_TYPES.QUESTION);
        break;
      case '@':
        this.addToken(FluxLexer.TOKEN_TYPES.AT);
        break;
      
      case '+':
        if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.PLUS_ASSIGN);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.PLUS);
        }
        break;
      case '-':
        if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.MINUS_ASSIGN);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.MINUS);
        }
        break;
      case '*':
        if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.MULTIPLY_ASSIGN);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.MULTIPLY);
        }
        break;
      case '/':
        if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.DIVIDE_ASSIGN);
        } else if (this.match('/')) {
          // Single line comment
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.match('*')) {
          // Multi-line comment
          this.blockComment();
        } else if (this.match('>')) {
          this.addToken(FluxLexer.TOKEN_TYPES.JSX_SELF_CLOSE);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.DIVIDE);
        }
        break;
      case '%':
        if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.MODULO_ASSIGN);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.MODULO);
        }
        break;
      
      case '!':
        this.addToken(this.match('=') ? 
          FluxLexer.TOKEN_TYPES.NOT_EQUALS : 
          FluxLexer.TOKEN_TYPES.LOGICAL_NOT
        );
        break;
      case '=':
        this.addToken(this.match('=') ? 
          FluxLexer.TOKEN_TYPES.EQUALS : 
          FluxLexer.TOKEN_TYPES.ASSIGN
        );
        break;
      case '<':
        if (this.peek() === '/') {
          this.advance(); // consume '/'
          this.addToken(FluxLexer.TOKEN_TYPES.JSX_CLOSE);
        } else if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.LESS_EQUAL);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.JSX_OPEN);
        }
        break;
      case '>':
        if (this.match('=')) {
          this.addToken(FluxLexer.TOKEN_TYPES.GREATER_EQUAL);
        } else if (this.peek() === '=' && this.peekNext() === '>') {
          // Arrow function =>
          this.advance(); // consume '='
          this.advance(); // consume '>'
          this.addToken(FluxLexer.TOKEN_TYPES.ARROW);
        } else {
          this.addToken(FluxLexer.TOKEN_TYPES.GREATER_THAN);
        }
        break;
      
      case '&':
        if (this.match('&')) {
          this.addToken(FluxLexer.TOKEN_TYPES.LOGICAL_AND);
        }
        break;
      case '|':
        if (this.match('|')) {
          this.addToken(FluxLexer.TOKEN_TYPES.LOGICAL_OR);
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
          this.addToken(FluxLexer.TOKEN_TYPES.UNKNOWN, c);
        }
        break;
    }
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    
    const text = this.source.substring(this.start, this.position);
    const type = FluxLexer.KEYWORDS[text] || FluxLexer.TOKEN_TYPES.IDENTIFIER;
    this.addToken(type, text);
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    
    // Look for decimal part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    
    const value = parseFloat(this.source.substring(this.start, this.position));
    this.addToken(FluxLexer.TOKEN_TYPES.NUMBER, value);
  }

  string(quote) {
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }
    
    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }
    
    this.advance(); // closing quote
    
    const value = this.source.substring(this.start + 1, this.position - 1);
    this.addToken(FluxLexer.TOKEN_TYPES.STRING, value);
  }

  blockComment() {
    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance(); // consume '*'
        this.advance(); // consume '/'
        break;
      }
      if (this.peek() === '\n') this.line++;
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
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.position);
  }

  peekNext() {
    if (this.position + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.position + 1);
  }

  isAlpha(c) {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c === '_';
  }

  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  isDigit(c) {
    return c >= '0' && c <= '9';
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
    if (type === FluxLexer.TOKEN_TYPES.EOF) {
      text = '';
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
}