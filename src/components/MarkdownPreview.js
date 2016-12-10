import React, { PropTypes } from 'react'
import markdown from 'lib/markdown'
import CodeMirror from 'codemirror'
import _ from 'lodash'
import katex from 'katex'

CodeMirror.modeURL = '../node_modules/codemirror/mode/%N/%N.js'

// TODO: should override whole meta.js
function parseMode (mode) {
  switch (mode) {
    case 'js':
    case 'javascript':
      mode = 'jsx'
  }
  let syntax = CodeMirror.findModeByName(mode)
  if (syntax == null) syntax = CodeMirror.findModeByName('Plain Text')
  return syntax
}

class MarkdownPreview extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    this.mountContent()

    this.iframe.contentWindow.document.head.innerHTML = `
    <link href="../node_modules/github-markdown-css/github-markdown.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="../node_modules/codemirror/lib/codemirror.css">
    <link rel="stylesheet" type="text/css" href="../node_modules/katex/dist/katex.min.css">
    <style>
      .markdown-body{
        font-size: 14px;
      }
      .CodeMirror {
        height: inherit;
      }
      .katex {
        text-align: center;
      }
      .katex .frac-line {
        top: 0.9em;
        position: relative;
      }
      .katex .reset-textstyle.scriptstyle {
        top: 0.4em;
        position: relative;
      }
    </style>
    `
    this.iframe.contentWindow.document.body.className = 'markdown-body'
  }

  componentWillUnmount () {
    this.unmountContent()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.content !== this.props.content) {
      this.unmountContent()
      this.mountContent()
    }
  }

  mountContent () {
    const { content } = this.props
    console.time('mount')
    // Render markdown

    console.time('parse md')
    this.iframe.contentWindow.document.body.innerHTML = markdown.quickRender(content)
    console.timeEnd('parse md')

    console.time('queue override')
    // Re-render codeblokcs by CodeMirror run mode and Katex
    let codeBlocks = this.iframe.contentWindow.document.body.querySelectorAll('pre code')
    _.forEach(codeBlocks, block => {
      if (block.className === 'math') {
        let value = _.unescape(block.innerHTML)
        let rendered = document.createElement('div')
        block.parentNode.parentNode.replaceChild(rendered, block.parentNode)
        rendered.className = 'katex'
        rendered.innerHTML = katex.renderToString(value)
        return
      }
      let syntax = parseMode(block.className.substring(9))

      CodeMirror.requireMode(syntax.mode, () => {
        let value = _.unescape(block.innerHTML)
        block.innerHTML = ''
        block.parentNode.className = ` cm-s-default CodeMirror`
        CodeMirror.runMode(value, syntax.mime, block, {
          tabSize: 2
        })
      })
    })

    let codeInlines = this.iframe.contentWindow.document.body.querySelectorAll('code.math')
    _.forEach(codeInlines, inline => {
      let value = _.unescape(inline.innerHTML)
      let rendered = document.createElement('span')
      inline.parentNode.replaceChild(rendered, inline)
      rendered.className = 'katex'
      rendered.innerHTML = katex.renderToString(value)
    })
    console.timeEnd('queue override')

    console.time('event init')
    // Apply click handler for switching mode
    this.iframe.contentWindow.document.addEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.addEventListener('mousedown', this.handleContentMouseDown)
    console.timeEnd('event init')

    console.timeEnd('mount')
  }

  unmountContent () {
    // Remove click handler before rewriting.
    this.iframe.contentWindow.document.removeEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.removeEventListener('mousedown', this.handleContentMouseDown)
  }

  handleContentClick = e => {
    this.props.onClick != null && this.props.onClick()
  }

  handleContentMouseUp = e => {
    this.props.onMouseUp != null && this.props.onMouseUp()
  }

  handleContentMouseDown = e => {
    this.props.onMouseDown != null && this.props.onMouseDown()
  }

  render () {
    const { className, style } = this.props

    return (
      <iframe ref={c => (this.iframe = c)}
        className={'MarkdownPreview ' + className}
        style={style}
        sandbox='allow-scripts'
      />
    )
  }
}

MarkdownPreview.propTypes = {
  content: PropTypes.string
}

export default MarkdownPreview
