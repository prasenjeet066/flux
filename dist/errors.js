// src/errors.js
var FluxError = class extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "FluxError";
    this.details = details;
    this.timestamp = /* @__PURE__ */ new Date();
  }
};
var LexerError = class extends FluxError {
  constructor(message, line, column, source) {
    super(`Lexer Error: ${message}`);
    this.name = "LexerError";
    this.line = line;
    this.column = column;
    this.source = source;
  }
  format() {
    return this.formatError("Lexer Error", this.message);
  }
};
var ParserError = class extends FluxError {
  constructor(message, token, expected = null) {
    super(`Parser Error: ${message}`);
    this.name = "ParserError";
    this.token = token;
    this.expected = expected;
    this.line = token ? token.line : 1;
    this.column = token ? token.column : 1;
  }
  format() {
    let message = this.message;
    if (this.expected) {
      message += ` (expected ${this.expected})`;
    }
    return this.formatError("Parser Error", message);
  }
};
var SemanticError = class extends FluxError {
  constructor(message, node, suggestion = null) {
    super(`Semantic Error: ${message}`);
    this.name = "SemanticError";
    this.node = node;
    this.suggestion = suggestion;
    this.line = node ? node.location?.line : 1;
    this.column = node ? node.location?.column : 1;
  }
  format() {
    let message = this.message;
    if (this.suggestion) {
      message += `
Suggestion: ${this.suggestion}`;
    }
    return this.formatError("Semantic Error", message);
  }
};
var CodegenError = class extends FluxError {
  constructor(message, node, context = null) {
    super(`Code Generation Error: ${message}`);
    this.name = "CodegenError";
    this.node = node;
    this.context = context;
    this.line = node ? node.location?.line : 1;
    this.column = node ? node.location?.column : 1;
  }
  format() {
    let message = this.message;
    if (this.context) {
      message += `
Context: ${this.context}`;
    }
    return this.formatError("Code Generation Error", message);
  }
};
var RuntimeError = class extends FluxError {
  constructor(message, component = null, stack = null) {
    super(`Runtime Error: ${message}`);
    this.name = "RuntimeError";
    this.component = component;
    this.stack = stack;
  }
  format() {
    let message = this.message;
    if (this.component) {
      message += `
Component: ${this.component}`;
    }
    return this.formatError("Runtime Error", message);
  }
};
var ErrorFormatter = class {
  static formatError(error, source = null) {
    if (error.format) {
      return error.format();
    }
    let output = `${error.name}: ${error.message}
`;
    if (error.line && error.column) {
      output += `at line ${error.line}, column ${error.column}
`;
      if (source) {
        output += this.formatSourceContext(source, error.line, error.column);
      }
    }
    if (error.stack) {
      output += `
Stack trace:
${error.stack}`;
    }
    return output;
  }
  static formatSourceContext(source, line, column, contextLines = 3) {
    const lines = source.split("\n");
    const startLine = Math.max(1, line - contextLines);
    const endLine = Math.min(lines.length, line + contextLines);
    let output = "\nSource context:\n";
    for (let i = startLine; i <= endLine; i++) {
      const marker = i === line ? ">>> " : "    ";
      const lineNumber = i.toString().padStart(3);
      const content = lines[i - 1] || "";
      output += `${marker}${lineNumber}: ${content}
`;
      if (i === line && column > 0) {
        const indent = "    " + " ".repeat(column - 1);
        output += `${indent}^
`;
      }
    }
    return output;
  }
  static formatErrorList(errors, source = null) {
    if (errors.length === 0) return "";
    let output = `
${errors.length} error(s) found:

`;
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      output += `${i + 1}. ${this.formatError(error, source)}
`;
      if (i < errors.length - 1) {
        output += "\n";
      }
    }
    return output;
  }
};
var ErrorCollector = class {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.maxErrors = 100;
  }
  addError(error) {
    if (this.errors.length < this.maxErrors) {
      this.errors.push(error);
    }
  }
  addWarning(warning) {
    this.warnings.push(warning);
  }
  hasErrors() {
    return this.errors.length > 0;
  }
  hasWarnings() {
    return this.warnings.length > 0;
  }
  clear() {
    this.errors = [];
    this.warnings = [];
  }
  formatAll(source = null) {
    let output = "";
    if (this.errors.length > 0) {
      output += ErrorFormatter.formatErrorList(this.errors, source);
    }
    if (this.warnings.length > 0) {
      output += `
${this.warnings.length} warning(s):
`;
      for (const warning of this.warnings) {
        output += `- ${warning.message}
`;
      }
    }
    return output;
  }
};
export {
  CodegenError,
  ErrorCollector,
  ErrorFormatter,
  FluxError,
  LexerError,
  ParserError,
  RuntimeError,
  SemanticError
};
//# sourceMappingURL=errors.js.map
