/*
 * Copyright (c) 2014, Groupon, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of GROUPON nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { runInThisContext } from 'vm'
import { nodes } from 'coffeescript'

function defaultReviver(_: string, value: any) {
  return value
}

function getFunctionNameIE(fn: any) {
  return fn.toString().match(/^function\s*([^( ]+)/)[1]
}

function nodeTypeString(csNode: any) {
  const ref = csNode.constructor.name
  return ref != null ? ref : getFunctionNameIE(csNode.constructor)
}

function syntaxErrorMessage(csNode: any, msg: string) {
  const ref = csNode.locationData
  const lineIdx = ref.first_line
  const columnIdx = ref.first_column
  let line = ''
  let column = ''
  if (lineIdx != null) {
    line = lineIdx + 1
  }
  if (columnIdx != null) {
    column = columnIdx + 1
  }
  return `Syntax error on line ${line}, column ${column}: ${msg}`
}

function parseStringLiteral(literal: string) {
  return runInThisContext(literal)
}

function parseRegExpLiteral(literal: string) {
  return runInThisContext(literal)
}

function transformKey(csNode: any) {
  const type = nodeTypeString(csNode)
  if (type !== 'Value') {
    throw new SyntaxError(syntaxErrorMessage(csNode, `${type} used as key`))
  }
  const value = csNode.base.value
  switch (value.charAt(0)) {
    case "'":
    case '"':
      return parseStringLiteral(value)
    default:
      return value
  }
}

const nodeTransforms = {
  Block: function Block(node: any, transformNode: any) {
    const expressions = node.expressions
    if (!expressions || expressions.length !== 1) {
      throw new SyntaxError(
        syntaxErrorMessage(node, 'One top level value expected')
      )
    }
    return transformNode(expressions[0])
  },
  Value: function Value(node: any, transformNode: any) {
    return transformNode(node.base)
  },
  Bool: function Bool(node: any) {
    return node.val === 'true'
  },
  BooleanLiteral: function BooleanLiteral(node: any) {
    return node.value === 'true'
  },
  Null: function Null() {
    return null
  },
  NullLiteral: function NullLiteral() {
    return null
  },
  Literal: function Literal(node: any) {
    const value = node.value
    try {
      switch (value.charAt(0)) {
        case "'":
        case '"':
          return parseStringLiteral(value)
        case '/':
          return parseRegExpLiteral(value)
        default:
          return JSON.parse(value)
      }
    } catch (error) {
      throw new SyntaxError(syntaxErrorMessage(node, error.message))
    }
  },
  NumberLiteral: function NumberLiteral(node: any) {
    return Number(node.value)
  },
  StringLiteral: function StringLiteral(node: any) {
    return parseStringLiteral(node.value)
  },
  RegexLiteral: function RegexLiteral(node: any) {
    return parseRegExpLiteral(node.value)
  },
  Arr: function Arr(node: any, transformNode: any) {
    return node.objects.map(transformNode)
  },
  Obj: function Obj(node: any, transformNode: any, reviver: any) {
    return node.properties.reduce((outObject: any, property: any) => {
      const variable = property.variable
      let value = property.value
      if (!variable) {
        return outObject
      }
      const keyName = transformKey(variable)
      value = transformNode(value)
      outObject[keyName] = reviver.call(outObject, keyName, value)
      return outObject
    }, {})
  },
  Op: function Op(node: any, transformNode: any) {
    if (node.second != null) {
      const left = transformNode(node.first)
      const right = transformNode(node.second)
      switch (node.operator) {
        case '-':
          return left - right
        case '+':
          return left + right
        case '*':
          return left * right
        case '/':
          return left / right
        case '%':
          return left % right
        case '&':
          return left & right
        case '|':
          return left | right
        case '^':
          return left ^ right
        case '<<':
          return left << right
        case '>>>':
          return left >>> right
        case '>>':
          return left >> right
        default:
          throw new SyntaxError(
            syntaxErrorMessage(node, `Unknown binary operator ${node.operator}`)
          )
      }
    } else {
      switch (node.operator) {
        case '-':
          return -transformNode(node.first)
        case '~':
          return ~transformNode(node.first)
        default:
          throw new SyntaxError(
            syntaxErrorMessage(node, `Unknown unary operator ${node.operator}`)
          )
      }
    }
  },
  Parens: function Parens(node: any, transformNode: any) {
    const expressions = node.body.expressions
    if (!expressions || expressions.length !== 1) {
      throw new SyntaxError(
        syntaxErrorMessage(node, 'Parenthesis may only contain one expression')
      )
    }
    return transformNode(expressions[0])
  }
}

export function parse(source: string) {
  const reviver = defaultReviver

  function transformNode(csNode: any) {
    const type = nodeTypeString(csNode)
    const transform = nodeTransforms[type]
    if (!transform) {
      throw new SyntaxError(syntaxErrorMessage(csNode, `Unexpected ${type}`))
    }
    return transform(csNode, transformNode, reviver)
  }
  if (typeof reviver !== 'function') {
    throw new TypeError('reviver has to be a function')
  }
  const coffeeAst = nodes(source.toString())
  const parsed = transformNode(coffeeAst)
  if (reviver === defaultReviver) {
    return parsed
  }
  const contextObj = {}
  contextObj[''] = parsed
  return reviver.call(contextObj, '', parsed)
}
