const remark = require('remark')
const lint = require('remark-lint')
const html = require('remark-html')
const emoji = require('remark-emoji')
const strip = require('strip-markdown')

const parser = remark()
  .use(lint)
  .use(html)
  .use(emoji)

function parse (value) {
  if (value == null) return ''
  return parser.process(value).toString()
}

const getTitleParser = remark()
  .use(p => {
    return (node, file) => {
      let titleNode = null

      // Try to find the first heading
      for (let child of node.children) {
        if (child.type === 'heading' && child.depth === 1) {
          titleNode = child
          break
        }
      }

      // If no heading found, use first paragraph.
      if (titleNode == null) {
        titleNode = node.children[0]
      }
      return {
        children: [titleNode],
        type: 'root'
      }
    }
  })
  .use(emoji)
  .use(strip)

function getTitle (value) {
  return getTitleParser.process(value).toString()
}

export default {
  parse,
  getTitle
}
