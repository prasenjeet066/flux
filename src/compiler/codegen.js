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

  visitComponentDeclaration(node) {
    const componentName = node.name.name;
    this.componentCount++;
    
    this.addLine(`class ${componentName} extends Component {`);
    this.indent++;
    
    // Constructor
    this.addLine("constructor(props = {}) {");
    this.indent++;
    this.addLine("super(props);");
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
    
    // Initialize effects
    if (node.effects.length > 0) {
      this.addLine("// Initialize effects");
      for (let i = 0; i < node.effects.length; i++) {
        const effect = node.effects[i];
        const deps = effect.dependencies.map(dep => this.visit(dep)).join(', ');
        
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
    for (const method of node.methods) {
      this.visitMethodDeclaration(method);
    }
    
    // Generate lifecycle methods
    for (const lifecycle of node.lifecycle) {
      this.visitLifecycleDeclaration(lifecycle);
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
      this.addLine(`FluxRuntime.registerRoute(${this.visit(path)}, ${componentName});`);
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
      
      // Add semicolon for expression statements
      if (node.body[i].type === 'ExpressionStatement') {
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
    if (node.left.type === 'MemberExpression' && 
        node.left.object.type === 'Identifier' &&
        node.left.object.name === 'this') {
      
      // Convert this.state = value to this.state.value = value
      this.add('this.');
      this.visit(node.left.property);
      this.add('.value ');
      this.add(node.operator);
      this.add(' ');
      this.visit(node.right);
    } else {
      this.visit(node.left);
      this.add(` ${node.operator} `);
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
    } else {
      this.add(String(node.value));
    }
  }

  visitIdentifier(node) {
    // Handle reactive state access
    if (this.isInRenderContext() && this.isReactiveState(node.name)) {
      this.add(`this.${node.name}.value`);
    } else {
      this.add(node.name);
    }
  }

  visitJSXElement(node) {
    this.add('createElement(');
    
    // Element name
    if (node.openingElement.name.name.charAt(0).toLowerCase() === node.openingElement.name.name.charAt(0)) {
      // HTML element
      this.add(`'${node.openingElement.name.name}'`);
    } else {
      // Component
      this.add(node.openingElement.name.name);
    }
    
    // Props
    if (node.openingElement.attributes.length > 0) {
      this.add(', {');
      
      for (let i = 0; i < node.openingElement.attributes.length; i++) {
        const attr = node.openingElement.attributes[i];
        this.add(`${attr.name.name}: `);
        
        if (attr.value.type === 'JSXExpressionContainer') {
          this.visit(attr.value.expression);
        } else {
          this.visit(attr.value);
        }
        
        if (i < node.openingElement.attributes.length - 1) {
          this.add(', ');
        }
      }
      
      this.add('}');
    } else {
      this.add(', null');
    }
    
    // Children
    if (node.children.length > 0) {
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

  visitJSXExpressionContainer(node) {
    this.visit(node.expression);
  }

  visitJSXText(node) {
    this.add(JSON.stringify(node.value));
  }

  // Utility methods
  isInRenderContext() {
    // Simple heuristic - in a real implementation, we'd track context properly
    return true;
  }

  isReactiveState(name) {
    // Check if this identifier refers to a reactive state variable
    // In a real implementation, we'd have proper scope tracking
    return true;
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