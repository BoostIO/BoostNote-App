import markdown from 'lib/markdown'

const rawString1 = `
This is not a title

# This is a title

Preview line

- [ ] task1
- [x] task2
- [ ] task3

`
const rawString2 = `
This should be title

this should be a previewed content
`

export default t => {
  let parsed1 = markdown.parse(rawString1)
  t.equal(parsed1.data.title, 'This is a title')
  t.equal(parsed1.data.preview, 'Preview line')

  let parsed2 = markdown.parse(rawString2)
  t.equal(parsed2.data.title, 'This should be title')
  t.equal(parsed2.data.preview, 'this should be a previewed content')
}
