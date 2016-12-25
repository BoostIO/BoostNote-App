function patch (context, key, value) {
  if (!context[key]) {
    context[key] = value
  }

  return context[key]
}

function lineNumberer () {
  return (node) => {
    node.children.forEach(child => {
      const line = child.position.start.line
      const data = patch(child, 'data', {})

      // Prepend line number to each block for testing
      // if (child.children != null) {
      //   child.children.unshift({type: 'inlineCode', value: child.position.start.line})
      // }

      /* Non-html */
      patch(data, 'line', line)
      /* Legacy remark-html */
      patch(data, 'htmlAttributes', {})
      /* Current remark-html */
      patch(data, 'hProperties', {})
      patch(data.htmlAttributes, 'line', line)
      patch(data.hProperties, 'line', line)
    })
  }
}

module.exports = lineNumberer
