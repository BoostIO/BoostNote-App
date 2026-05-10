import { htmlContainsImage, htmlToMarkdown } from './htmlToMarkdown'

describe('htmlToMarkdown', () => {
  it('ignores html without images so normal paste behavior is preserved', () => {
    expect(htmlContainsImage('<p>Hello <strong>world</strong></p>')).toBe(false)
    expect(htmlToMarkdown('<p>Hello <strong>world</strong></p>')).toBe(null)
  })

  it('converts web clipboard html with images to markdown', () => {
    expect(
      htmlToMarkdown(
        '<p>Hello <strong>world</strong></p><p><img src="https://example.com/cat.png" alt="Cat photo" title="Source"></p>'
      )
    ).toBe(
      'Hello **world**\n\n![Cat photo](https://example.com/cat.png "Source")'
    )
  })

  it('preserves links around pasted web content', () => {
    expect(
      htmlToMarkdown(
        '<div><a href="https://example.com/post">Read post</a><br><img src="https://example.com/post.jpg"></div>'
      )
    ).toBe(
      '[Read post](https://example.com/post)\n![](https://example.com/post.jpg)'
    )
  })
})
