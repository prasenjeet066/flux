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
    for (const decorator of node.decorators) {
      let decoratorStr = `@${decorator.name.name}`;
      if (decorator.arguments && decorator.arguments.length > 0) {
        decoratorStr += "(";
        for (let i = 0; i < decorator.arguments.length; i++) {
          decoratorStr += this.stringifyValue(decorator.arguments[i]);
          if (i < decorator.arguments.length - 1) decoratorStr += ", ";
        }
        decoratorStr += ")";
      }
      this.addLine(`// ${decoratorStr}`);
    }
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
      const path = routeDecorator.arguments[0];
      this.addLine(`FluxRuntime.registerRoute(${this.visit(path)}, ${componentName});`);
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
  stringifyValue(node) {
    if (node.type === "Literal") {
      if (typeof node.value === "string") {
        return `"${node.value}"`;
      }
      return String(node.value);
    }
    if (node.type === "ObjectExpression") {
      let result = "{ ";
      for (let i = 0; i < node.properties.length; i++) {
        const prop = node.properties[i];
        result += `${prop.key.name || prop.key.value}: ${this.stringifyValue(prop.value)}`;
        if (i < node.properties.length - 1) result += ", ";
      }
      result += " }";
      return result;
    }
    return "unknown";
  }
};
var FluxOptimizer = class {
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
    return ast;
  }
  inlineConstants(ast) {
    return ast;
  }
  optimizeReactiveUpdates(ast) {
    return ast;
  }
  bundleComponents(ast) {
    return ast;
  }
};
export {
  FluxCodeGenerator,
  FluxOptimizer
};
//# sourceMappingURL=codegen.js.map
