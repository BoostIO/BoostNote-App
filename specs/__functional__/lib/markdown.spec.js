import markdown from 'lib/markdown'

const contentWithEmojiTitle = `
This is not a title

# :smile: **This** is a title

Preview line

- [ ] task1
- [x] task2
- [ ] task3

`

const contentWithOutHeading = `
This should be title

this should be a previewed content
`

const contentWithImg = `
# Awesome Electron [![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

[<img src="https://rawgit.com/sindresorhus/awesome-electron/master/electron-logo.svg" align="right" width="100">](http://electron.atom.io)

> Useful resources for creating apps with [Electron](http://electron.atom.io)
`

// const mathString = `
// L is lift force,
// $$\\rho$$ is air density,
// $$v$$ is true airspeed,
// $$A$$ is the wing area, and
// $$C_L$$ is the lift coefficient at the desired angle of attack

// $$$
// L = \\frac{1}{2} \\rho v^2 A C_L
// $$$
// `

describe('markdown', () => {
  it('should parse emoji', () => {
    const parsed = markdown.parse(contentWithEmojiTitle)
    expect(parsed.data.title).toEqual('😄 This is a title')
    expect(parsed.data.preview).toEqual('Preview line')
  })

  it('should return first line as a title', () => {
    const parsed = markdown.parse(contentWithOutHeading)
    expect(parsed.data.title).toEqual('This should be title')
    expect(parsed.data.preview).toEqual('this should be a previewed content')
  })

  it('should handle empty string', () => {
    const parsed = markdown.parse('')
    expect(parsed.data.title).toEqual('')
    expect(parsed.data.preview).toEqual('')
  })

  it('skip img when finding preview', () => {
    const parsed = markdown.parse(contentWithImg)
    expect(parsed.data.title).toEqual('Awesome Electron Awesome')
    expect(parsed.data.preview).toEqual('Useful resources for creating apps with Electron')
  })
})
