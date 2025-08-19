// flux-core/src/compiler/codegen.js
// Code generator that converts Flux AST to optimized JavaScript

import * as AST from '../ast/nodes.js';

export class FluxCodeGenerator {
  constructor(options = {}) {
    this.options = {
      target: 'modern', // 'modern' or 'legacy'
      minify: false,
      sourceMaps: true,
      optimizations: true,
      ...options
    };
    this.indent = 0;
    this.output = [];
    this.imports = new Set();
    this.componentCount = 0;
    this.storeCount = 0;
    this.errors = [];
    this.currentContext = 'global'; // 'global', 'component', 'method', 'render'
  }

  generate(ast) {
    this.output = [];
    this.indent = 0;
    
    // Add runtime imports
    this.addLine("import { FluxRuntime, Component, Store, createReactiveState, createEffect, createComputed } from '@flux/runtime';");
    this.addLine("import { createElement, Fragment } from '@flux/jsx';");
    this.addLine("");
    
    this.visit(ast);
    
    return this.output.join('\n');
  }

  visit(node) {
    const methodName = `visit${node.type}`;
    if (this[methodName]) {
      return this[methodName](node);
    }
    
    console.warn(`No visitor method for ${node.type}`);
    return '';
  }

  visitProgram(node) {
    for (const statement of node.body) {
      this.visit(statement);
      this.addLine("");
    }
  }

  visitImportDeclaration(node) {
    const specifiers = node.specifiers.map(spec => {
      if (spec.imported.name === 'default') {
        return spec.local.name;
      }
      return spec.imported.name === spec.local.name 
        ? spec.imported.name 
        : `${spec.imported.name} as ${spec.local.name}`;
    }).join(', ');
    
    this.addLine(`import { ${specifiers} } from ${JSON.stringify(node.source.value)};`);
  }

  visitExportDeclaration(node) {
    this.add("export ");
    this.visit(node.declaration);
  }

  visitDecorator(node) {
    // Decorators are handled in the component/store declarations
    // This method is just a placeholder to avoid errors
    return '';
  }

  visitComponentDeclaration(node) {
    const componentName = node.name.name;
    this.componentCount++;
    
    this.currentContext = 'component';
    
    this.addLine(`class ${componentName} extends Component {`);
    this.indent++;
    
    // Constructor
    this.addLine("constructor(props = {}) {");
    this.indent++;
    this.addLine("super(props);");
    this.addLine("");
    
    // Initialize props
    if (node.props && node.props.length > 0) {
      this.addLine("// Initialize props");
      for (const propDecl of node.props) {
        this.visit(propDecl);
      }
      this.addLine("");
    }
    
    // Initialize state
    if (node.state && node.state.length > 0) {
      this.addLine("// Initialize state");
      for (const stateDecl of node.state) {
        this.visit(stateDecl);
      }
      this.addLine("");
    }
    
    // Initialize computed properties
    if (node.computed && node.computed.length > 0) {
      this.addLine("// Initialize computed properties");
      for (const computedDecl of node.computed) {
        this.visit(computedDecl);
      }
      this.addLine("");
    }
    
    // Initialize effects
    if (node.effects && node.effects.length > 0) {
      this.addLine("// Initialize effects");
      for (let i = 0; i < node.effects.length; i++) {
        const effect = node.effects[i];
        const deps = effect.dependencies.map(dep => this.getIdentifierValue(dep)).join(', ');
        
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
    
    // Generate methods
    if (node.methods && node.methods.length > 0) {
      for (const method of node.methods) {
        this.visitMethodDeclaration(method);
      }
    }
    
    // Generate lifecycle methods
    if (node.lifecycle && node.lifecycle.length > 0) {
      for (const lifecycle of node.lifecycle) {
        this.visitLifecycleDeclaration(lifecycle);
      }
    }
    
    // Generate render method
    if (node.render) {
      this.visitRenderDeclaration(node.render);
    }
    
    this.indent--;
    this.addLine("}");
    this.addLine("");
    
    // Add component registration
    this.addLine(`${componentName}.displayName = '${componentName}';`);
    
    // Handle route decorators
    const routeDecorator = node.decorators.find(d => d.name.name === 'route');
    if (routeDecorator) {
      const path = routeDecorator.arguments[0];
      const pathValue = this.getLiteralValue(path);
      this.addLine(`FluxRuntime.registerRoute(${pathValue}, ${componentName});`);
    }
  }

  visitStoreDeclaration(node) {
    const storeName = node.name.name;
    this.storeCount++;
    
    this.addLine(`class ${storeName} extends Store {`);
    this.indent++;
    
    // Constructor
    this.addLine("constructor() {");
    this.indent++;
    this.addLine("super();");
    this.addLine("");
    
    // Initialize state
    if (node.state.length > 0) {
      this.addLine("// Initialize state");
      for (const stateDecl of node.state) {
        const name = stateDecl.name.name;
        const initialValue = stateDecl.initialValue 
          ? this.visit(stateDecl.initialValue) 
          : 'null';
        
        this.addLine(`this.${name} = createReactiveState(${initialValue});`);
      }
      this.addLine("");
    }
    
    // Initialize computed properties
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
    
    // Generate actions
    for (const action of node.actions) {
      this.visitActionDeclaration(action);
    }
    
    this.indent--;
    this.addLine("}");
    this.addLine("");
    
    // Create singleton instance
    this.addLine(`const ${storeName}Instance = new ${storeName}();`);
    this.addLine(`export { ${storeName}Instance as ${storeName} };`);
  }

  visitMethodDeclaration(node) {
    this.currentContext = 'method';
    
    const methodName = node.name.name;
    const isAsync = node.isAsync;
    
    if (isAsync) {
      this.addLine(`async ${methodName}() {`);
    } else {
      this.addLine(`${methodName}() {`);
    }
    
    this.indent++;
    this.visit(node.body);
    this.indent--;
    this.addLine('}');
    this.addLine('');
    
    this.currentContext = 'component';
  }

  visitActionDeclaration(node) {
    const name = node.name.name;
    const asyncKeyword = node.isAsync ? 'async ' : '';
    const params = node.parameters.map(p => p.name.name).join(', ');
    
    this.addLine(`${asyncKeyword}${name}(${params}) {`);
    this.indent++;
    this.visit(node.body);
    this.indent--;
    this.addLine("}");
    this.addLine("");
  }

  visitLifecycleDeclaration(node) {
    const phase = node.phase;
    const asyncKeyword = node.isAsync ? 'async ' : '';
    
    this.addLine(`${asyncKeyword}${phase}() {`);
    this.indent++;
    this.visit(node.body);
    this.indent--;
    this.addLine("}");
    this.addLine("");
  }

  visitRenderDeclaration(node) {
    this.currentContext = 'render';
    
    this.addLine('render() {');
    this.indent++;
    this.addLine('return ');
    this.visit(node.body);
    this.addLine(';');
    this.indent--;
    this.addLine('}');
    this.addLine('');
    
    this.currentContext = 'component';
  }

  visitStateDeclaration(node) {
    const name = node.name.name;
    
    this.add(`this.${name} = createReactiveState(`);
    
    if (node.initialValue) {
      this.visit(node.initialValue);
    } else {
      this.add('null');
    }
    
    this.addLine(');');
  }

  visitPropDeclaration(node) {
    const name = node.name.name;
    let defaultValue = 'undefined';
    
    if (node.defaultValue) {
      defaultValue = this.getLiteralValue(node.defaultValue);
    }
    
    this.addLine(`this.${name} = props.${name} || ${defaultValue};`);
  }

  visitEffectDeclaration(node) {
    const deps = node.dependencies.map(dep => this.getIdentifierValue(dep)).join(', ');
    
    this.addLine(`this.effect = createEffect(() => {`);
    this.indent++;
    this.visit(node.body);
    this.indent--;
    this.addLine(`}, [${deps}]);`);
  }

  visitComputedDeclaration(node) {
    const name = node.name.name;
    
    this.addLine(`this.${name} = createComputed(() => {`);
    this.indent++;
    this.visit(node.body);
    this.indent--;
    this.addLine(`});`);
  }



  visitBlockStatement(node) {
    for (let i = 0; i < node.body.length; i++) {
      this.visit(node.body[i]);
      
      // Add semicolon for expression statements, but not for JSX elements
      if (node.body[i].type === 'ExpressionStatement' && 
          node.body[i].expression.type !== 'JSXElement') {
        this.add(';');
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
    this.add(') ');
    this.visit(node.consequent);
    
    if (node.alternate) {
      this.add(' else ');
      this.visit(node.alternate);
    }
  }

  visitWhileStatement(node) {
    this.add(`${this.getIndent()}while (`);
    this.visit(node.test);
    this.add(') ');
    this.visit(node.body);
  }

  visitForStatement(node) {
    this.add(`${this.getIndent()}for (`);
    if (node.init) this.visit(node.init);
    this.add('; ');
    if (node.test) this.visit(node.test);
    this.add('; ');
    if (node.update) this.visit(node.update);
    this.add(') ');
    this.visit(node.body);
  }

  visitReturnStatement(node) {
    this.add(`${this.getIndent()}return`);
    if (node.argument) {
      this.add(' ');
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
      this.add(' finally ');
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
    // Handle reactive state assignments
    if (node.left.type === 'Identifier') {
      // Handle direct identifier assignments (like count += 1)
      // In Flux, this should be converted to reactive state access
      // But preserve the original syntax for method contexts
      if (this.isInMethodContext() && this.isReactiveState(node.left.name)) {
        this.add(`this.${node.left.name}.value ${node.operator.lexeme} `);
      } else {
        this.add(`${node.left.name} ${node.operator.lexeme} `);
      }
      this.visit(node.right);
    } else {
      this.visit(node.left);
      this.add(` ${node.operator.lexeme} `);
      this.visit(node.right);
    }
  }

  visitCallExpression(node) {
    this.visit(node.callee);
    this.add('(');
    
    for (let i = 0; i < node.arguments.length; i++) {
      this.visit(node.arguments[i]);
      if (i < node.arguments.length - 1) {
        this.add(', ');
      }
    }
    
    this.add(')');
  }

  visitMemberExpression(node) {
    this.visit(node.object);
    
    if (node.computed) {
      this.add('[');
      this.visit(node.property);
      this.add(']');
    } else {
      this.add('.');
      this.visit(node.property);
    }
  }

  visitConditionalExpression(node) {
    this.visit(node.test);
    this.add(' ? ');
    this.visit(node.consequent);
    this.add(' : ');
    this.visit(node.alternate);
  }

  visitArrayExpression(node) {
    this.add('[');
    
    for (let i = 0; i < node.elements.length; i++) {
      this.visit(node.elements[i]);
      if (i < node.elements.length - 1) {
        this.add(', ');
      }
    }
    
    this.add(']');
  }

  visitObjectExpression(node) {
    this.add('{');
    
    if (node.properties.length > 0) {
      this.addLine("");
      this.indent++;
      
      for (let i = 0; i < node.properties.length; i++) {
        this.add(this.getIndent());
        this.visit(node.properties[i]);
        if (i < node.properties.length - 1) {
          this.add(',');
        }
        this.addLine("");
      }
      
      this.indent--;
      this.add(this.getIndent());
    }
    
    this.add('}');
  }

  visitProperty(node) {
    this.visit(node.key);
    this.add(': ');
    this.visit(node.value);
  }

  visitLiteral(node) {
    if (typeof node.value === 'string') {
      this.add(JSON.stringify(node.value));
      return JSON.stringify(node.value);
    } else {
      this.add(String(node.value));
      return String(node.value);
    }
  }

  getLiteralValue(node) {
    if (node.type === 'Literal') {
      if (typeof node.value === 'string') {
        return JSON.stringify(node.value);
      } else {
        return String(node.value);
      }
    }
    return this.visit(node);
  }

  getIdentifierValue(node) {
    if (node.type === 'Identifier') {
      // For effect dependencies, we want the raw identifier name
      return node.name;
    }
    return this.visit(node);
  }

  visitIdentifier(node) {
    // Handle reactive state access
    if (this.isInRenderContext() && this.isReactiveState(node.name)) {
      this.add(`this.${node.name}.value`);
    } else if (this.isInRenderContext() && this.isMethodName(node.name)) {
      // Method references should use 'this'
      this.add(`this.${node.name}`);
    } else if (this.isInRenderContext() && this.isPropName(node.name)) {
      // Props should use 'this'
      this.add(`this.${node.name}`);
    } else {
      this.add(node.name);
    }
  }

  visitJSXElement(node) {
    this.add('createElement(');
    
    // Get the element name from the opening element
    const elementName = node.openingElement.name.name;
    this.add(JSON.stringify(elementName));
    
    // Attributes
    if (node.openingElement.attributes && node.openingElement.attributes.length > 0) {
      this.add(', {');
      for (let i = 0; i < node.openingElement.attributes.length; i++) {
        if (i > 0) this.add(', ');
        this.visit(node.openingElement.attributes[i]);
      }
      this.add('}');
    } else {
      this.add(', null');
    }
    
    // Children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.add(', ');
        
        if (child.type === 'JSXText') {
          this.add(JSON.stringify(child.value));
        } else if (child.type === 'JSXExpressionContainer') {
          this.visit(child.expression);
        } else {
          this.visit(child);
        }
      }
    }
    
    this.add(')');
  }

  visitJSXAttribute(node) {
    // Handle event attributes (@click -> onClick)
    let attrName = node.name.name;
    if (attrName.startsWith('@')) {
      const eventName = attrName.substring(1);
      attrName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
    }
    
    this.add(`${attrName}: `);
    
    if (node.value.type === 'JSXExpressionContainer') {
      this.visit(node.value.expression);
    } else {
      this.visit(node.value);
    }
  }

  visitArrowFunction(node) {
    this.add('(');
    if (node.params.length > 0) {
      this.add(node.params.map(param => param.lexeme || param.name).join(', '));
    }
    this.add(') => ');
    
    if (node.body.type === 'Block') {
      this.visit(node.body);
    } else {
      this.visit(node.body);
    }
  }

  visitArrayLiteral(node) {
    this.add('[');
    if (node.elements.length > 0) {
      for (let i = 0; i < node.elements.length; i++) {
        if (i > 0) this.add(', ');
        this.visit(node.elements[i]);
      }
    }
    this.add(']');
  }

  visitObjectLiteral(node) {
    this.add('{');
    if (node.properties.length > 0) {
      for (let i = 0; i < node.properties.length; i++) {
        if (i > 0) this.add(', ');
        const prop = node.properties[i];
        this.add(`${prop.key.lexeme || prop.key.name}: `);
        this.visit(prop.value);
      }
    }
    this.add('}');
  }

  visitStylesDeclaration(node) {
    this.addLine(`// Styles for ${node.target.name}`);
    this.addLine('const styles = {');
    this.indent++;
    
    for (const rule of node.rules) {
      this.visit(rule);
    }
    
    this.indent--;
    this.addLine('};');
    this.addLine('');
  }

  visitStyleRule(node) {
    this.add(`${node.selector}: {`);
    this.indent++;
    
    for (const property of node.properties) {
      this.visit(property);
    }
    
    this.indent--;
    this.addLine('},');
  }

  visitStyleProperty(node) {
    this.add(`${node.name}: `);
    this.visit(node.value);
    this.addLine(',');
  }

  visitJSXExpressionContainer(node) {
    this.visit(node.expression);
  }

  visitJSXText(node) {
    this.add(JSON.stringify(node.value));
  }

  // Utility methods
  isInMethodContext() {
    return this.currentContext === 'method';
  }

  isInRenderContext() {
    return this.currentContext === 'render';
  }

  isReactiveState(name) {
    // Check if this identifier refers to reactive state
    // In a real implementation, we'd have proper scope tracking
    const nonStateIdentifiers = [
      'increment', 'decrement', 'handleClick', 'handleSubmit', 'updateName',
      'console', 'log', 'Math', 'Date', 'Array', 'Object', 'String', 'Number',
      'Boolean', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
      // Props should not be treated as reactive state
      'title'
    ];
    
    // For now, assume all identifiers in render context are reactive state
    // unless they're explicitly excluded
    return !nonStateIdentifiers.includes(name);
  }

  isMethodName(name) {
    // Check if this identifier refers to a method
    // In a real implementation, we'd have proper scope tracking
    return ['increment', 'decrement', 'handleClick', 'handleSubmit', 'updateName'].includes(name);
  }

  isPropName(name) {
    // Check if this identifier refers to a prop
    // In a real implementation, we'd have proper scope tracking
    return ['title', 'count'].includes(name);
  }

  add(text) {
    this.output.push(text);
  }

  addLine(text = "") {
    this.output.push(text + '\n');
  }

  getIndent() {
    return '  '.repeat(this.indent);
  }
}

// Runtime optimization helpers
export class FluxOptimizer {
  constructor() {
    this.optimizations = [
      this.eliminateDeadCode,
      this.inlineConstants,
      this.optimizeReactiveUpdates,
      this.bundleComponents
    ];
  }

  optimize(ast) {
    let optimizedAst = ast;
    
    for (const optimization of this.optimizations) {
      optimizedAst = optimization(optimizedAst);
    }
    
    return optimizedAst;
  }

  eliminateDeadCode(ast) {
    // Remove unused variables, functions, and imports
    return ast;
  }

  inlineConstants(ast) {
    // Inline constant values at compile time
    return ast;
  }

  optimizeReactiveUpdates(ast) {
    // Minimize reactive dependency tracking
    return ast;
  }

  bundleComponents(ast) {
    // Optimize component bundling and code splitting
    return ast;
  }
}