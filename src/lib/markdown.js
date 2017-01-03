const remark = require('remark')
const html = require('remark-html')
const emoji = require('remark-emoji')
const meta = require('./metaMapper')
const math = require('./mathParser')
const slug = require('remark-slug')
const line = require('./lineNumberer')

const quickRenderer = remark()
  .use(math)
  .use(slug)
  .use(emoji)
  .use(line)
  .use(html)

function quickRender (value) {
  if (value == null) return ''
  return quickRenderer.process(value, {breaks: true})
}

const parser = remark()
  .use(math)
  .use(slug)
  .use(emoji)
  .use(meta)
  .use(line)
  .use(html)

function parse (value) {
  return parser.process(value, {breaks: true})
}

export default {
  quickRender,
  parser,
  parse
}
