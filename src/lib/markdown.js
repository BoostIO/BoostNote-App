const remark = require('remark')
const lint = require('remark-lint')
const html = require('remark-html')
const emoji = require('remark-emoji')
const meta = require('./metaMapper')
const math = require('./mathParser')

const quickRenderer = remark()
  .use(math)
  .use(emoji)
  .use(html)

function quickRender (value) {
  if (value == null) return ''
  return quickRenderer.process(value, {breaks: true})
}

const parser = remark()
  .use(math)
  .use(emoji)
  .use(meta)
  .use(lint)
  .use(html)

function parse (value) {
  return parser.process(value, {breaks: true})
}

export default {
  quickRender,
  parser,
  parse
}
