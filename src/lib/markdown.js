const remark = require('remark')
const lint = require('remark-lint')
const html = require('remark-html')
const emoji = require('remark-emoji')

const parser = remark()
  .use(lint)
  .use(html)
  .use(emoji)

function parse (value) {
  if (value == null) return ''
  return parser.process(value).toString()
}

export default {
  parse
}
