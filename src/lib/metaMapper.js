const strip = require('strip-markdown')

const stripProcess = strip()

function stripNode (node) {
  return stripProcess(node)
}

module.exports = p => {
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

    let titleNode = node.children[targetIndex]
    let secondNode = node.children[targetIndex + 1]

    file.data.title = p.stringify(stripNode(titleNode))
    file.data.preview = p.stringify(stripNode(secondNode))
  }
}
