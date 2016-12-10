function locator (value, fromIndex) {
  return value.indexOf('$$', fromIndex)
}

const INLINE_MATH = /^\$\$((?:\\\$|[^$])+)\$\$/
const BLOCK_MATH = /^\$\$\$\n((?:\\\$|[^$])+)\n\$\$\$/

function inlineTokenizer (eat, value, silent) {
  const match = INLINE_MATH.exec(value)

  if (match) {
    if (silent) {
      return true
    }

    return eat(match[0])({
      type: 'inlineCode',
      value: match[1].trim(),
      data: {
        hProperties: {
          class: 'math'
        }
      }
    })
  }
}

function blockTokenizer (eat, value, silent) {
  const match = BLOCK_MATH.exec(value)

  if (match) {
    if (silent) {
      return true
    }

    return eat(match[0])({
      type: 'code',
      value: match[1].trim(),
      data: {
        hProperties: {
          class: 'math'
        }
      }
    })
  }
}

inlineTokenizer.locator = locator
inlineTokenizer.notInLink = true

blockTokenizer.locator = function locator (value, fromIndex) {
  return value.indexOf('$$$', fromIndex)
}
blockTokenizer.notInLink = true


module.exports = function plugin (p) {
  const Parser = p.Parser

  // Inline math
  const inlineTokenizers = Parser.prototype.inlineTokenizers
  const inlineMethods = Parser.prototype.inlineMethods
  inlineTokenizers.math = inlineTokenizer
  inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'math')

  const blockTokenizers = Parser.prototype.blockTokenizers
  const blockMethods = Parser.prototype.blockMethods
  blockTokenizers.math = blockTokenizer
  blockMethods.splice(blockMethods.indexOf('html'), 0, 'math')
}
