const remark = require('remark')
const strip = require('strip-markdown')

const parser = remark()
.use(strip)

function stripNode (node) {
  if (node == null) {
    return ''
  }

  return parser.process(parser.stringify(JSON.parse(JSON.stringify(node)))).toString()
}

/**
 * Map meta data to data attribute
 *
 * @param {any} processor
 * @returns nothing
 */
module.exports = processor => {
  return function mapData (node, file) {
    let targetIndex = 0
    // Try to find the first heading
    node.children.some((child, index) => {
      if (child.type === 'heading') {
        targetIndex = index
        return true
      }
      return false
    })

    file.data.title = stripNode(node.children[targetIndex])
    file.data.preview = stripNode(node.children[targetIndex + 1])

    // If preview content empty, try to use next block.
    let count = targetIndex + 1
    while ((file.data.preview === '' || file.data.preview === '\n') && count < node.children.length) {
      file.data.preview = stripNode(node.children[count + 1])
      count = count + 1
    }
  }
}
