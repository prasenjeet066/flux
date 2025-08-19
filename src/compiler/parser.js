// flux-core/src/compiler/parser.js
// Recursive descent parser for Flux language

import { FluxLexer } from './lexer.js';
import * as AST from '../ast/nodes.js';

export class FluxParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.errors = [];
  }

  static parse(source) {
    const lexer = new FluxLexer(source);
    const tokens = lexer.tokenize();
    const parser = new FluxParser(tokens);
    return parser.program();
  }

  program() {
    const body = [];

    while (!this.isAtEnd()) {
      // Skip newlines at top level
      if (this.check('NEWLINE')) {
        this.advance();
        continue;
      }

      const stmt = this.topLevelStatement();
      if (stmt) body.push(stmt);
    }

    return new AST.Program(body, this.getCurrentLocation());
  }

  topLevelStatement() {
    try {
      if (this.match('IMPORT')) {
        return this.importDeclaration();
      }

      if (this.match('EXPORT')) {
        return this.exportDeclaration();
      }

      // Handle decorators
      const decorators = [];
      while (this.check('AT')) {
        decorators.push(this.decorator());
      }

      if (this.match('COMPONENT')) {
        return this.componentDeclaration(decorators);
      }

      if (this.match('STORE')) {
        return this.storeDeclaration(decorators);
      }

      if (this.match('GUARD')) {
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

    if (this.check('LEFT_BRACE')) {
      // Named imports: import { name1, name2 } from 'module'
      this.consume('LEFT_BRACE', 'Expected "{"');

      do {
        const imported = this.consume('IDENTIFIER', 'Expected identifier');
        let local = imported;

        if (this.match('AS')) {
          local = this.consume('IDENTIFIER', 'Expected identifier after "as"');
        }

        specifiers.push(new AST.ImportSpecifier(
          new AST.Identifier(imported.lexeme),
          new AST.Identifier(local.lexeme),
        ));
      } while (this.match('COMMA'));

      this.consume('RIGHT_BRACE', 'Expected "}"');
    } else {
      // Default import: import name from 'module'
      const name = this.consume('IDENTIFIER', 'Expected identifier');
      specifiers.push(new AST.ImportSpecifier(
        new AST.Identifier('default'),
        new AST.Identifier(name.lexeme),
      ));
    }

    this.consume('FROM', 'Expected "from"');
    const source = this.consume('STRING', 'Expected module path');

    return new AST.ImportDeclaration(
      specifiers,
      new AST.Literal(source.literal),
      this.getCurrentLocation(),
    );
  }

  exportDeclaration() {
    const declaration = this.topLevelStatement();
    return new AST.ExportDeclaration(declaration, this.getCurrentLocation());
  }

  decorator() {
    this.consume('AT', 'Expected "@"');
    const name = this.consume('IDENTIFIER', 'Expected decorator name');

    let args = [];
    if (this.match('LEFT_PAREN')) {
      args = this.argumentList();
      this.consume('RIGHT_PAREN', 'Expected ")"');
    }

    return new AST.Decorator(
      new AST.Identifier(name.lexeme),
      args,
      this.getCurrentLocation(),
    );
  }

  componentDeclaration(decorators = []) {
    const name = this.consume('IDENTIFIER', 'Expected component name');

    this.consume('LEFT_BRACE', 'Expected "{"');

    const body = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
      if (this.check('NEWLINE')) {
        this.advance();
        continue;
      }

      const member = this.componentMember();
      if (member) body.push(member);
    }

    this.consume('RIGHT_BRACE', 'Expected "}"');

    return new AST.ComponentDeclaration(
      new AST.Identifier(name.lexeme),
      decorators,
      body,
      this.getCurrentLocation(),
    );
  }

  componentMember() {
    if (this.match('STATE')) {
      return this.stateDeclaration();
    }

    if (this.match('PROP')) {
      return this.propDeclaration();
    }

    if (this.match('METHOD')) {
      return this.methodDeclaration();
    }

    if (this.match('EFFECT')) {
      return this.effectDeclaration();
    }

    if (this.match('COMPUTED')) {
      return this.computedDeclaration();
    }

    if (this.match('RENDER')) {
      return this.renderDeclaration();
    }

    if (this.match('LIFECYCLE')) {
      return this.lifecycleDeclaration();
    }

    return this.statement();
  }

  stateDeclaration() {
    const name = this.consume('IDENTIFIER', 'Expected state variable name');

    let typeAnnotation = null;
    if (this.match('COLON')) {
      typeAnnotation = this.typeAnnotation();
    }

    let initialValue = null;
    if (this.match('ASSIGN')) {
      initialValue = this.expression();
    }

    return new AST.StateDeclaration(
      new AST.Identifier(name.lexeme),
      initialValue,
      typeAnnotation,
      this.getCurrentLocation(),
    );
  }

  propDeclaration() {
    const name = this.consume('IDENTIFIER', 'Expected prop name');

    let typeAnnotation = null;
    if (this.match('COLON')) {
      typeAnnotation = this.typeAnnotation();
    }

    let defaultValue = null;
    if (this.match('ASSIGN')) {
      defaultValue = this.expression();
    }

    return new AST.PropDeclaration(
      new AST.Identifier(name.lexeme),
      typeAnnotation,
      defaultValue,
      this.getCurrentLocation(),
    );
  }

  methodDeclaration() {
    const isAsync = this.match('ASYNC');
    const name = this.consume('IDENTIFIER', 'Expected method name');

    this.consume('LEFT_PAREN', 'Expected "("');
    const parameters = this.parameterList();
    this.consume('RIGHT_PAREN', 'Expected ")"');

    const body = this.blockStatement();

    return new AST.MethodDeclaration(
      new AST.Identifier(name.lexeme),
      parameters,
      body,
      isAsync,
      this.getCurrentLocation(),
    );
  }

  effectDeclaration() {
    const dependencies = [];

    if (this.match('ON')) {
      // effect on dependency1, dependency2 { ... }
      dependencies.push(this.expression());

      while (this.match('COMMA')) {
        dependencies.push(this.expression());
      }
    }

    const body = this.blockStatement();

    return new AST.EffectDeclaration(
      dependencies,
      body,
      this.getCurrentLocation(),
    );
  }

  computedDeclaration() {
    const name = this.consume('IDENTIFIER', 'Expected computed property name');

    this.consume('LEFT_PAREN', 'Expected "("');
    this.consume('RIGHT_PAREN', 'Expected ")"');

    const body = this.blockStatement();

    return new AST.ComputedDeclaration(
      new AST.Identifier(name.lexeme),
      body,
      this.getCurrentLocation(),
    );
  }

  renderDeclaration() {
    const body = this.blockStatement();

    return new AST.RenderDeclaration(
      body,
      this.getCurrentLocation(),
    );
  }

  lifecycleDeclaration() {
    const isAsync = this.match('ASYNC');
    const phase = this.consume('IDENTIFIER', 'Expected lifecycle phase');

    this.consume('LEFT_PAREN', 'Expected "("');
    this.consume('RIGHT_PAREN', 'Expected ")"');

    const body = this.blockStatement();

    return new AST.LifecycleDeclaration(
      phase.lexeme,
      body,
      isAsync,
      this.getCurrentLocation(),
    );
  }

  storeDeclaration(decorators = []) {
    const name = this.consume('IDENTIFIER', 'Expected store name');

    this.consume('LEFT_BRACE', 'Expected "{"');

    const body = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
      if (this.check('NEWLINE')) {
        this.advance();
        continue;
      }

      const member = this.storeMember();
      if (member) body.push(member);
    }

    this.consume('RIGHT_BRACE', 'Expected "}"');

    return new AST.StoreDeclaration(
      new AST.Identifier(name.lexeme),
      body,
      this.getCurrentLocation(),
    );
  }

  storeMember() {
    if (this.match('STATE')) {
      return this.stateDeclaration();
    }

    if (this.match('ACTION')) {
      return this.actionDeclaration();
    }

    if (this.match('COMPUTED')) {
      return this.computedDeclaration();
    }

    return this.statement();
  }

  actionDeclaration() {
    const isAsync = this.match('ASYNC');
    const name = this.consume('IDENTIFIER', 'Expected action name');

    this.consume('LEFT_PAREN', 'Expected "("');
    const parameters = this.parameterList();
    this.consume('RIGHT_PAREN', 'Expected ")"');

    const body = this.blockStatement();

    return new AST.ActionDeclaration(
      new AST.Identifier(name.lexeme),
      parameters,
      body,
      isAsync,
      this.getCurrentLocation(),
    );
  }

  guardDeclaration(decorators = []) {
    const name = this.consume('IDENTIFIER', 'Expected guard name');

    this.consume('LEFT_PAREN', 'Expected "("');
    const parameters = this.parameterList();
    this.consume('RIGHT_PAREN', 'Expected ")"');

    const body = this.blockStatement();

    return new AST.GuardDeclaration(
      new AST.Identifier(name.lexeme),
      parameters,
      body,
      this.getCurrentLocation(),
    );
  }

  // Statements
  statement() {
    if (this.match('IF')) {
      return this.ifStatement();
    }

    if (this.match('WHILE')) {
      return this.whileStatement();
    }

    if (this.match('FOR')) {
      return this.forStatement();
    }

    if (this.match('RETURN')) {
      return this.returnStatement();
    }

    if (this.match('TRY')) {
      return this.tryStatement();
    }

    if (this.match('LEFT_BRACE')) {
      return this.blockStatement();
    }

    return this.expressionStatement();
  }

  ifStatement() {
    this.consume('LEFT_PAREN', 'Expected "(" after "if"');
    const test = this.expression();
    this.consume('RIGHT_PAREN', 'Expected ")" after if condition');

    const consequent = this.statement();
    let alternate = null;

    if (this.match('ELSE')) {
      alternate = this.statement();
    }

    return new AST.IfStatement(test, consequent, alternate, this.getCurrentLocation());
  }

  whileStatement() {
    this.consume('LEFT_PAREN', 'Expected "(" after "while"');
    const test = this.expression();
    this.consume('RIGHT_PAREN', 'Expected ")" after while condition');

    const body = this.statement();

    return new AST.WhileStatement(test, body, this.getCurrentLocation());
  }

  forStatement() {
    this.consume('LEFT_PAREN', 'Expected "(" after "for"');

    let init = null;
    if (!this.check('SEMICOLON')) {
      init = this.expression();
    }
    this.consume('SEMICOLON', 'Expected ";" after for loop initializer');

    let test = null;
    if (!this.check('SEMICOLON')) {
      test = this.expression();
    }
    this.consume('SEMICOLON', 'Expected ";" after for loop condition');

    let update = null;
    if (!this.check('RIGHT_PAREN')) {
      update = this.expression();
    }
    this.consume('RIGHT_PAREN', 'Expected ")" after for clauses');

    const body = this.statement();

    return new AST.ForStatement(init, test, update, body, this.getCurrentLocation());
  }

  returnStatement() {
    let argument = null;

    if (!this.check('NEWLINE') && !this.check('SEMICOLON')) {
      argument = this.expression();
    }

    return new AST.ReturnStatement(argument, this.getCurrentLocation());
  }

  tryStatement() {
    const block = this.blockStatement();

    let handler = null;
    if (this.match('CATCH')) {
      this.consume('LEFT_PAREN', 'Expected "(" after "catch"');
      const param = this.consume('IDENTIFIER', 'Expected catch parameter');
      this.consume('RIGHT_PAREN', 'Expected ")" after catch parameter');

      const body = this.blockStatement();
      handler = new AST.CatchClause(
        new AST.Identifier(param.lexeme),
        body,
        this.getCurrentLocation(),
      );
    }

    let finalizer = null;
    if (this.match('FINALLY')) {
      finalizer = this.blockStatement();
    }

    return new AST.TryStatement(block, handler, finalizer, this.getCurrentLocation());
  }

  blockStatement() {
    this.consume('LEFT_BRACE', 'Expected "{"');

    const body = [];
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
      if (this.check('NEWLINE')) {
        this.advance();
        continue;
      }

      body.push(this.statement());
    }

    this.consume('RIGHT_BRACE', 'Expected "}"');

    return new AST.BlockStatement(body, this.getCurrentLocation());
  }

  expressionStatement() {
    const expr = this.expression();
    return new AST.ExpressionStatement(expr, this.getCurrentLocation());
  }

  // Expressions
  expression() {
    return this.assignment();
  }

  assignment() {
    const expr = this.ternary();

    if (this.match('ASSIGN', 'PLUS_ASSIGN', 'MINUS_ASSIGN')) {
      const operator = this.previous();
      const value = this.assignment();

      if (expr.type !== 'Identifier') {
        throw new Error('Invalid assignment target');
      }

      return new AST.AssignmentExpression(
        expr,
        operator.lexeme,
        value,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  ternary() {
    let expr = this.logicalOr();

    if (this.match('QUESTION')) {
      const consequent = this.expression();
      this.consume('COLON', 'Expected ":" in ternary expression');
      const alternate = this.ternary();

      expr = new AST.ConditionalExpression(
        expr,
        consequent,
        alternate,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  logicalOr() {
    let expr = this.logicalAnd();

    while (this.match('LOGICAL_OR')) {
      const operator = this.previous();
      const right = this.logicalAnd();
      expr = new AST.BinaryExpression(
        expr,
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  logicalAnd() {
    let expr = this.equality();

    while (this.match('LOGICAL_AND')) {
      const operator = this.previous();
      const right = this.equality();
      expr = new AST.BinaryExpression(
        expr,
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  equality() {
    let expr = this.comparison();

    while (this.match('EQUALS', 'NOT_EQUALS')) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new AST.BinaryExpression(
        expr,
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  comparison() {
    let expr = this.addition();

    while (this.match('GREATER_THAN', 'GREATER_EQUAL', 'LESS_THAN', 'LESS_EQUAL')) {
      const operator = this.previous();
      const right = this.addition();
      expr = new AST.BinaryExpression(
        expr,
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  addition() {
    let expr = this.multiplication();

    while (this.match('PLUS', 'MINUS')) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new AST.BinaryExpression(
        expr,
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  multiplication() {
    let expr = this.unary();

    while (this.match('MULTIPLY', 'DIVIDE', 'MODULO')) {
      const operator = this.previous();
      const right = this.unary();
      expr = new AST.BinaryExpression(
        expr,
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return expr;
  }

  unary() {
    if (this.match('LOGICAL_NOT', 'MINUS', 'PLUS')) {
      const operator = this.previous();
      const right = this.unary();
      return new AST.UnaryExpression(
        operator.lexeme,
        right,
        this.getCurrentLocation(),
      );
    }

    return this.postfix();
  }

  postfix() {
    let expr = this.primary();

    while (true) {
      if (this.match('LEFT_PAREN')) {
        // Function call
        const args = this.argumentList();
        this.consume('RIGHT_PAREN', 'Expected ")" after arguments');

        expr = new AST.CallExpression(
          expr,
          args,
          this.getCurrentLocation(),
        );
      } else if (this.match('LEFT_BRACKET')) {
        // Array access
        const index = this.expression();
        this.consume('RIGHT_BRACKET', 'Expected "]" after array index');

        expr = new AST.MemberExpression(
          expr,
          index,
          true, // computed
          this.getCurrentLocation(),
        );
      } else if (this.match('DOT')) {
        // Property access
        const property = this.consume('IDENTIFIER', 'Expected property name');

        expr = new AST.MemberExpression(
          expr,
          new AST.Identifier(property.lexeme),
          false, // not computed
          this.getCurrentLocation(),
        );
      } else if (this.match('ARROW')) {
        // Arrow function
        const params = [];
        if (this.check('LEFT_PAREN')) {
          this.advance(); // consume '('
          if (!this.check('RIGHT_PAREN')) {
            do {
              params.push(this.consume('IDENTIFIER', 'Expected parameter name'));
            } while (this.match('COMMA'));
          }
          this.consume('RIGHT_PAREN', 'Expected ")" after parameters');
        } else {
          params.push(this.consume('IDENTIFIER', 'Expected parameter name'));
        }

        let body;
        if (this.check('LEFT_BRACE')) {
          body = this.blockStatement();
        } else {
          body = this.expression();
        }

        expr = new AST.ArrowFunctionExpression(
          params.map(p => new AST.Identifier(p.lexeme)),
          body,
          this.getCurrentLocation(),
        );
      } else {
        break;
      }
    }

    return expr;
  }

  primary() {
    if (this.match('BOOLEAN')) {
      return new AST.Literal(this.previous().literal, this.getCurrentLocation());
    }

    if (this.match('NUMBER')) {
      return new AST.Literal(this.previous().literal, this.getCurrentLocation());
    }

    if (this.match('STRING')) {
      return new AST.Literal(this.previous().literal, this.getCurrentLocation());
    }

    if (this.match('IDENTIFIER')) {
      return new AST.Identifier(this.previous().lexeme, this.getCurrentLocation());
    }

    if (this.match('LEFT_PAREN')) {
      const expr = this.expression();
      this.consume('RIGHT_PAREN', 'Expected ")" after expression');
      return expr;
    }

    if (this.match('LEFT_BRACKET')) {
      // Array literal
      const elements = [];

      if (!this.check('RIGHT_BRACKET')) {
        do {
          elements.push(this.expression());
        } while (this.match('COMMA'));
      }

      this.consume('RIGHT_BRACKET', 'Expected "]" after array elements');

      return new AST.ArrayExpression(elements, this.getCurrentLocation());
    }

    if (this.match('LEFT_BRACE')) {
      // Object literal
      const properties = [];

      if (!this.check('RIGHT_BRACE')) {
        do {
          if (this.check('NEWLINE')) {
            this.advance();
            continue;
          }

          let key;
          if (this.match('STRING')) {
            key = new AST.Literal(this.previous().literal);
          } else {
            const name = this.consume('IDENTIFIER', 'Expected property name');
            key = new AST.Identifier(name.lexeme);
          }

          this.consume('COLON', 'Expected ":" after property name');
          const value = this.expression();

          properties.push(new AST.Property(key, value, 'init', this.getCurrentLocation()));
        } while (this.match('COMMA'));
      }

      this.consume('RIGHT_BRACE', 'Expected "}" after object properties');

      return new AST.ObjectExpression(properties, this.getCurrentLocation());
    }

    // JSX Element
    if (this.check('JSX_OPEN')) {
      return this.jsxElement();
    }

    throw new Error(`Unexpected token: ${this.peek().lexeme} at line ${this.peek().line}`);
  }

  jsxElement() {
    this.consume('JSX_OPEN', 'Expected "<"');

    // Element name
    const name = this.consume('IDENTIFIER', 'Expected element name');
    const elementName = new AST.Identifier(name.lexeme);

    // Attributes
    const attributes = [];
    while (!this.check('GREATER_THAN') && !this.check('JSX_SELF_CLOSE') && !this.isAtEnd()) {
      attributes.push(this.jsxAttribute());
    }

    // Self-closing tag
    if (this.match('JSX_SELF_CLOSE')) {
      return new AST.JSXElement(
        new AST.JSXOpeningElement(elementName, attributes, true),
        [],
        null,
        this.getCurrentLocation(),
      );
    }

    this.consume('GREATER_THAN', 'Expected ">" after opening tag');

    // Children
    const children = [];
    while (!this.check('JSX_CLOSE') && !this.isAtEnd()) {
      if (this.check('JSX_OPEN') && this.peekNext().type === 'IDENTIFIER') {
        // Nested element
        children.push(this.jsxElement());
      } else if (this.check('LEFT_BRACE')) {
        // Expression
        this.advance(); // consume '{'
        const expr = this.expression();
        this.consume('RIGHT_BRACE', 'Expected "}" after JSX expression');
        children.push(new AST.JSXExpressionContainer(expr));
      } else {
        // Text content
        let text = '';
        while (!this.check('JSX_OPEN') && !this.check('JSX_CLOSE') && !this.check('LEFT_BRACE') && !this.isAtEnd()) {
          text += this.advance().lexeme;
        }
        if (text.trim()) {
          children.push(new AST.JSXText(text.trim()));
        }
      }
    }

    // Closing tag
    this.consume('JSX_CLOSE', 'Expected closing tag');
    const closingName = this.consume('IDENTIFIER', 'Expected closing tag name');
    this.consume('GREATER_THAN', 'Expected ">" after closing tag');

    if (closingName.lexeme !== name.lexeme) {
      throw new Error(`Mismatched JSX tags: ${name.lexeme} and ${closingName.lexeme}`);
    }

    return new AST.JSXElement(
      new AST.JSXOpeningElement(elementName, attributes, false),
      children,
      new AST.JSXClosingElement(new AST.Identifier(closingName.lexeme)),
      this.getCurrentLocation(),
    );
  }

  jsxAttribute() {
    let name;
    if (this.check('AT')) {
      this.advance(); // consume '@'
      const eventName = this.consume('IDENTIFIER', 'Expected event name after @');
      name = new AST.Identifier(`@${eventName.lexeme}`);
    } else {
      const attrName = this.consume('IDENTIFIER', 'Expected attribute name');
      name = new AST.Identifier(attrName.lexeme);
    }

    if (this.match('ASSIGN')) {
      let value;
      if (this.match('STRING')) {
        value = new AST.Literal(this.previous().literal);
      } else if (this.match('LEFT_BRACE')) {
        const expr = this.expression();
        this.consume('RIGHT_BRACE', 'Expected "}" after JSX expression');
        value = new AST.JSXExpressionContainer(expr);
      } else {
        throw new Error('Expected attribute value');
      }

      return new AST.JSXAttribute(
        new AST.Identifier(name.lexeme),
        value,
        this.getCurrentLocation(),
      );
    }

    // Boolean attribute
    return new AST.JSXAttribute(
      new AST.Identifier(name.lexeme),
      new AST.Literal(true),
      this.getCurrentLocation(),
    );
  }

  parameterList() {
    const parameters = [];

    if (!this.check('RIGHT_PAREN')) {
      do {
        const name = this.consume('IDENTIFIER', 'Expected parameter name');

        let typeAnnotation = null;
        if (this.match('COLON')) {
          typeAnnotation = this.typeAnnotation();
        }

        let defaultValue = null;
        if (this.match('ASSIGN')) {
          defaultValue = this.expression();
        }

        parameters.push({
          name: new AST.Identifier(name.lexeme),
          typeAnnotation,
          defaultValue,
        });
      } while (this.match('COMMA'));
    }

    return parameters;
  }

  argumentList() {
    const args = [];

    if (!this.check('RIGHT_PAREN')) {
      do {
        args.push(this.expression());
      } while (this.match('COMMA'));
    }

    return args;
  }

  typeAnnotation() {
    if (this.match('IDENTIFIER')) {
      const typeName = this.previous().lexeme;

      switch (typeName) {
      case 'string':
        return new AST.TSStringKeyword();
      case 'number':
        return new AST.TSNumberKeyword();
      case 'boolean':
        return new AST.TSBooleanKeyword();
      default:
        return new AST.Identifier(typeName);
      }
    }

    throw new Error('Expected type annotation');
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
    return this.peek().type === 'EOF';
  }

  peek() {
    return this.tokens[this.current];
  }

  peekNext() {
    if (this.current + 1 >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF
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
      if (this.previous().type === 'NEWLINE') return;

      switch (this.peek().type) {
      case 'COMPONENT':
      case 'STORE':
      case 'GUARD':
      case 'IF':
      case 'FOR':
      case 'WHILE':
      case 'RETURN':
        return;
      }

      this.advance();
    }
  }

  getCurrentLocation() {
    const token = this.peek();
    return AST.createLocation(token.line, token.column, token.line, token.column);
  }
}
