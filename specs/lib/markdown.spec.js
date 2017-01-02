import markdown from 'lib/markdown'

const rawString1 = `
This is not a title

# :smile: **This** is a title

Preview line

- [ ] task1
- [x] task2
- [ ] task3

`

const rawString2 = `
This should be title

this should be a previewed content
`

const rawString4 = `
# Awesome Electron [![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

[<img src="https://rawgit.com/sindresorhus/awesome-electron/master/electron-logo.svg" align="right" width="100">](http://electron.atom.io)

> Useful resources for creating apps with [Electron](http://electron.atom.io)
`

const mathString = `
L is lift force,
$$\\rho$$ is air density,
$$v$$ is true airspeed,
$$A$$ is the wing area, and
$$C_L$$ is the lift coefficient at the desired angle of attack

$$$
L = \\frac{1}{2} \\rho v^2 A C_L
$$$
`

export default t => {
  let parsed1 = markdown.parse(rawString1)
  t.equal(parsed1.data.title, '😄 This is a title\n')
  t.equal(parsed1.data.preview, 'Preview line\n')

  let parsed2 = markdown.parse(rawString2)
  t.equal(parsed2.data.title, 'This should be title\n')
  t.equal(parsed2.data.preview, 'this should be a previewed content\n')

  let parsed3 = markdown.parse('')
  t.equal(parsed3.data.title, '')
  t.equal(parsed3.data.preview, '')

  let parsed4 = markdown.parse(rawString4)
  t.equal(parsed4.data.title, 'Awesome Electron Awesome\n')
  t.equal(parsed4.data.preview, 'Useful resources for creating apps with Electron\n')

  // let parsedMath = markdown.parse(mathString)
  // console.log(parsedMath.toString())
}
