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
var ThrowStatement = class extends ASTNode {
  constructor(argument, location) {
    super("ThrowStatement", location);
    this.argument = argument;
  }
};
var VariableDeclaration = class extends ASTNode {
  constructor(declarations, kind, location) {
    super("VariableDeclaration", location);
    this.declarations = declarations;
    this.kind = kind;
  }
};
var VariableDeclarator = class extends ASTNode {
  constructor(id, init, location) {
    super("VariableDeclarator", location);
    this.id = id;
    this.init = init;
  }
};
var RouteDeclaration = class extends ASTNode {
  constructor(path, component, guards, loaders, meta, location) {
    super("RouteDeclaration", location);
    this.path = path;
    this.component = component;
    this.guards = guards || [];
    this.loaders = loaders || [];
    this.meta = meta;
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
var StylesDeclaration = class extends ASTNode {
  constructor(componentName, rules, location) {
    super("StylesDeclaration", location);
    this.componentName = componentName;
    this.rules = rules;
  }
};
var CSSRule = class extends ASTNode {
  constructor(selector, declarations, location) {
    super("CSSRule", location);
    this.selector = selector;
    this.declarations = declarations;
  }
};
var CSSDeclaration = class extends ASTNode {
  constructor(property, value, location) {
    super("CSSDeclaration", location);
    this.property = property;
    this.value = value;
  }
};
var TypeAnnotation = class extends ASTNode {
  constructor(typeAnnotation, location) {
    super("TypeAnnotation", location);
    this.typeAnnotation = typeAnnotation;
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
var TSArrayType = class extends ASTNode {
  constructor(elementType, location) {
    super("TSArrayType", location);
    this.elementType = elementType;
  }
};
var TSUnionType = class extends ASTNode {
  constructor(types, location) {
    super("TSUnionType", location);
    this.types = types;
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
export {
  ASTNode,
  ActionDeclaration,
  ArrayExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CSSDeclaration,
  CSSRule,
  CallExpression,
  CatchClause,
  ComponentDeclaration,
  ComputedDeclaration,
  ConditionalExpression,
  Decorator,
  EffectDeclaration,
  ExportDeclaration,
  ExpressionStatement,
  ForStatement,
  GuardDeclaration,
  Identifier,
  IfStatement,
  ImportDeclaration,
  ImportSpecifier,
  JSXAttribute,
  JSXClosingElement,
  JSXElement,
  JSXExpressionContainer,
  JSXOpeningElement,
  JSXText,
  LifecycleDeclaration,
  Literal,
  MemberExpression,
  MethodDeclaration,
  ObjectExpression,
  Program,
  PropDeclaration,
  Property,
  RenderDeclaration,
  ReturnStatement,
  RouteDeclaration,
  StateDeclaration,
  StoreDeclaration,
  StylesDeclaration,
  TSArrayType,
  TSBooleanKeyword,
  TSNumberKeyword,
  TSStringKeyword,
  TSUnionType,
  ThrowStatement,
  TryStatement,
  TypeAnnotation,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
  createLocation
};
//# sourceMappingURL=nodes.js.map
