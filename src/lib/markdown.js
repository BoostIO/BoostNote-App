const remark = require('remark')
const lint = require('remark-lint')
const html = require('remark-html')
const emoji = require('remark-emoji')
const metaMapper = require('./metaMapper')

const quickRenderer = remark()
  .use(html)
  .use(emoji)

function quickRender (value) {
  if (value == null) return ''
  return quickRenderer.process(value, {breaks: true})
}

const parser = remark()
  .use(lint)
  .use(emoji)
  .use(metaMapper)

function parse (value) {
  return parser.process(value)
}

export default {
  quickRender,
  parse
}
