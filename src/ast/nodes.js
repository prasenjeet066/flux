// flux-core/src/ast/nodes.js
// Abstract Syntax Tree node definitions for Flux language

export class ASTNode {
  constructor(type, location) {
    this.type = type;
    this.location = location;
  }
}

// Program root
export class Program extends ASTNode {
  constructor(body, location) {
    super('Program', location);
    this.body = body; // Array of top-level statements
  }
}

// Imports and Exports
export class ImportDeclaration extends ASTNode {
  constructor(specifiers, source, location) {
    super('ImportDeclaration', location);
    this.specifiers = specifiers;
    this.source = source;
  }
}

export class ImportSpecifier extends ASTNode {
  constructor(imported, local, location) {
    super('ImportSpecifier', location);
    this.imported = imported;
    this.local = local;
  }
}

export class ExportDeclaration extends ASTNode {
  constructor(declaration, location) {
    super('ExportDeclaration', location);
    this.declaration = declaration;
  }
}

// Component Declaration
export class ComponentDeclaration extends ASTNode {
  constructor(name, decorators, body, location) {
    super('ComponentDeclaration', location);
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
    
    // Organize body items
    this.organizeBody();
  }
  
  organizeBody() {
    for (const item of this.body) {
      switch (item.type) {
        case 'StateDeclaration':
          this.state.push(item);
          break;
        case 'PropDeclaration':
          this.props.push(item);
          break;
        case 'MethodDeclaration':
          this.methods.push(item);
          break;
        case 'EffectDeclaration':
          this.effects.push(item);
          break;
        case 'ComputedDeclaration':
          this.computed.push(item);
          break;
        case 'RenderDeclaration':
          this.render = item;
          break;
        case 'LifecycleDeclaration':
          this.lifecycle.push(item);
          break;
      }
    }
  }
}

// Store Declaration
export class StoreDeclaration extends ASTNode {
  constructor(name, body, location) {
    super('StoreDeclaration', location);
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
        case 'StateDeclaration':
          this.state.push(item);
          break;
        case 'ActionDeclaration':
          this.actions.push(item);
          break;
        case 'ComputedDeclaration':
          this.computed.push(item);
          break;
      }
    }
  }
}

// Declarations
export class StateDeclaration extends ASTNode {
  constructor(name, initialValue, typeAnnotation, location) {
    super('StateDeclaration', location);
    this.name = name;
    this.initialValue = initialValue;
    this.typeAnnotation = typeAnnotation;
  }
}

export class PropDeclaration extends ASTNode {
  constructor(name, typeAnnotation, defaultValue, location) {
    super('PropDeclaration', location);
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.defaultValue = defaultValue;
  }
}

export class MethodDeclaration extends ASTNode {
  constructor(name, parameters, body, isAsync, location) {
    super('MethodDeclaration', location);
    this.name = name;
    this.parameters = parameters;
    this.body = body;
    this.isAsync = isAsync;
  }
}

export class ActionDeclaration extends ASTNode {
  constructor(name, parameters, body, isAsync, location) {
    super('ActionDeclaration', location);
    this.name = name;
    this.parameters = parameters;
    this.body = body;
    this.isAsync = isAsync;
  }
}

export class EffectDeclaration extends ASTNode {
  constructor(dependencies, body, location) {
    super('EffectDeclaration', location);
    this.dependencies = dependencies;
    this.body = body;
  }
}

export class ComputedDeclaration extends ASTNode {
  constructor(name, body, location) {
    super('ComputedDeclaration', location);
    this.name = name;
    this.body = body;
  }
}

export class RenderDeclaration extends ASTNode {
  constructor(body, location) {
    super('RenderDeclaration', location);
    this.body = body;
  }
}

export class LifecycleDeclaration extends ASTNode {
  constructor(phase, body, isAsync, location) {
    super('LifecycleDeclaration', location);
    this.phase = phase; // 'mounted', 'updated', 'unmounted', etc.
    this.body = body;
    this.isAsync = isAsync;
  }
}

// Decorators
export class Decorator extends ASTNode {
  constructor(name, arguments_, location) {
    super('Decorator', location);
    this.name = name;
    this.arguments = arguments_ || [];
  }
}

// Expressions
export class BinaryExpression extends ASTNode {
  constructor(left, operator, right, location) {
    super('BinaryExpression', location);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

export class UnaryExpression extends ASTNode {
  constructor(operator, operand, location) {
    super('UnaryExpression', location);
    this.operator = operator;
    this.operand = operand;
  }
}

export class AssignmentExpression extends ASTNode {
  constructor(left, operator, right, location) {
    super('AssignmentExpression', location);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

export class CallExpression extends ASTNode {
  constructor(callee, arguments_, location) {
    super('CallExpression', location);
    this.callee = callee;
    this.arguments = arguments_;
  }
}

export class MemberExpression extends ASTNode {
  constructor(object, property, computed, location) {
    super('MemberExpression', location);
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
}

export class ConditionalExpression extends ASTNode {
  constructor(test, consequent, alternate, location) {
    super('ConditionalExpression', location);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

export class ArrayExpression extends ASTNode {
  constructor(elements, location) {
    super('ArrayExpression', location);
    this.elements = elements;
  }
}

export class ObjectExpression extends ASTNode {
  constructor(properties, location) {
    super('ObjectExpression', location);
    this.properties = properties;
  }
}

export class Property extends ASTNode {
  constructor(key, value, kind, location) {
    super('Property', location);
    this.key = key;
    this.value = value;
    this.kind = kind || 'init';
  }
}

// Literals
export class Literal extends ASTNode {
  constructor(value, location) {
    super('Literal', location);
    this.value = value;
  }
}

export class Identifier extends ASTNode {
  constructor(name, location) {
    super('Identifier', location);
    this.name = name;
  }
}

// JSX-like Nodes
export class JSXElement extends ASTNode {
  constructor(openingElement, children, closingElement, location) {
    super('JSXElement', location);
    this.openingElement = openingElement;
    this.children = children;
    this.closingElement = closingElement;
    this.selfClosing = !closingElement;
  }
}

export class JSXOpeningElement extends ASTNode {
  constructor(name, attributes, selfClosing, location) {
    super('JSXOpeningElement', location);
    this.name = name;
    this.attributes = attributes;
    this.selfClosing = selfClosing;
  }
}

export class JSXClosingElement extends ASTNode {
  constructor(name, location) {
    super('JSXClosingElement', location);
    this.name = name;
  }
}

export class JSXAttribute extends ASTNode {
  constructor(name, value, location) {
    super('JSXAttribute', location);
    this.name = name;
    this.value = value;
  }
}

export class JSXExpressionContainer extends ASTNode {
  constructor(expression, location) {
    super('JSXExpressionContainer', location);
    this.expression = expression;
  }
}

export class JSXText extends ASTNode {
  constructor(value, location) {
    super('JSXText', location);
    this.value = value;
  }
}

// Statements
export class ExpressionStatement extends ASTNode {
  constructor(expression, location) {
    super('ExpressionStatement', location);
    this.expression = expression;
  }
}

export class BlockStatement extends ASTNode {
  constructor(body, location) {
    super('BlockStatement', location);
    this.body = body;
  }
}

export class IfStatement extends ASTNode {
  constructor(test, consequent, alternate, location) {
    super('IfStatement', location);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

export class WhileStatement extends ASTNode {
  constructor(test, body, location) {
    super('WhileStatement', location);
    this.test = test;
    this.body = body;
  }
}

export class ForStatement extends ASTNode {
  constructor(init, test, update, body, location) {
    super('ForStatement', location);
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
}

export class ReturnStatement extends ASTNode {
  constructor(argument, location) {
    super('ReturnStatement', location);
    this.argument = argument;
  }
}

export class TryStatement extends ASTNode {
  constructor(block, handler, finalizer, location) {
    super('TryStatement', location);
    this.block = block;
    this.handler = handler;
    this.finalizer = finalizer;
  }
}

export class CatchClause extends ASTNode {
  constructor(param, body, location) {
    super('CatchClause', location);
    this.param = param;
    this.body = body;
  }
}

export class ThrowStatement extends ASTNode {
  constructor(argument, location) {
    super('ThrowStatement', location);
    this.argument = argument;
  }
}

export class VariableDeclaration extends ASTNode {
  constructor(declarations, kind, location) {
    super('VariableDeclaration', location);
    this.declarations = declarations;
    this.kind = kind; // 'var', 'let', 'const'
  }
}

export class VariableDeclarator extends ASTNode {
  constructor(id, init, location) {
    super('VariableDeclarator', location);
    this.id = id;
    this.init = init;
  }
}

// Route specific nodes
export class RouteDeclaration extends ASTNode {
  constructor(path, component, guards, loaders, meta, location) {
    super('RouteDeclaration', location);
    this.path = path;
    this.component = component;
    this.guards = guards || [];
    this.loaders = loaders || [];
    this.meta = meta;
  }
}

export class GuardDeclaration extends ASTNode {
  constructor(name, parameters, body, location) {
    super('GuardDeclaration', location);
    this.name = name;
    this.parameters = parameters;
    this.body = body;
  }
}

// Type annotations
export class TypeAnnotation extends ASTNode {
  constructor(typeAnnotation, location) {
    super('TypeAnnotation', location);
    this.typeAnnotation = typeAnnotation;
  }
}

export class TSStringKeyword extends ASTNode {
  constructor(location) {
    super('TSStringKeyword', location);
  }
}

export class TSNumberKeyword extends ASTNode {
  constructor(location) {
    super('TSNumberKeyword', location);
  }
}

export class TSBooleanKeyword extends ASTNode {
  constructor(location) {
    super('TSBooleanKeyword', location);
  }
}

export class TSArrayType extends ASTNode {
  constructor(elementType, location) {
    super('TSArrayType', location);
    this.elementType = elementType;
  }
}

export class TSUnionType extends ASTNode {
  constructor(types, location) {
    super('TSUnionType', location);
    this.types = types;
  }
}

// Styles
export class StylesDeclaration extends ASTNode {
  constructor(target, rules, decorators, location) {
    super('StylesDeclaration', location);
    this.target = target;
    this.rules = rules;
    this.decorators = decorators || [];
  }
}

export class StyleRule extends ASTNode {
  constructor(selector, properties, location) {
    super('StyleRule', location);
    this.selector = selector;
    this.properties = properties;
  }
}

export class StyleProperty extends ASTNode {
  constructor(name, value, location) {
    super('StyleProperty', location);
    this.name = name;
    this.value = value;
  }
}

// Utility function to create location object
export function createLocation(startLine, startColumn, endLine, endColumn) {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };
}