import React, { PropTypes } from 'react'
import markdown from 'lib/markdown'
import CodeMirror from 'codemirror'
import _ from 'lodash'
import katex from 'katex'

const { shell } = require('electron')

CodeMirror.modeURL = '../../node_modules/codemirror/mode/%N/%N.js'

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

function buildFontStyle (fontSize, fontFamily, codeBlockFontFamily) {
  return `
   .markdown-body {
      font-size: ${fontSize}px;
      font-family: ${fontFamily}, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
   .markdown-body code,
   .markdown-body pre {
      font-family: ${codeBlockFontFamily};
    }
  `
}

class MarkdownPreview extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    this.iframe.contentWindow.document.head.innerHTML = `
    <link href="../../node_modules/github-markdown-css/github-markdown.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="../../node_modules/codemirror/lib/codemirror.css">
    <link rel="stylesheet" type="text/css" id="codeMirrorTheme">
    <link rel="stylesheet" type="text/css" href="../../node_modules/katex/dist/katex.min.css">
    <style>
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
      body[theme="dark"].markdown-body {
        background-color: #1E1E1E;
      }
      body[theme="dark"].markdown-body {
        color: #EEE;
      }

      body[theme="dark"].markdown-body hr {
        background-color: #444;
      }

      body[theme="dark"].markdown-body blockquote {
        color: #999;
        border-left: 0.25em solid #444;
      }

      body[theme="dark"].markdown-body kbd {
        background-color: #fcfcfc;
        border: solid 1px #444;
        border-bottom-color: #555;
        box-shadow: inset 0 -1px 0 #555;
      }

      body[theme="dark"].markdown-body h1 .octicon-link,
      body[theme="dark"].markdown-body h2 .octicon-link,
      body[theme="dark"].markdown-body h3 .octicon-link,
      body[theme="dark"].markdown-body h4 .octicon-link,
      body[theme="dark"].markdown-body h5 .octicon-link,
      body[theme="dark"].markdown-body h6 .octicon-link {
        color: #E0E0E0;
      }

      body[theme="dark"].markdown-body h1 {
        border-color: #444;
      }

      body[theme="dark"].markdown-body h2 {
        border-color: #444;
      }

      body[theme="dark"].markdown-body table tr {
        background-color: #1e1e1e;
        border-color: #444;
      }
      body[theme="dark"].markdown-body table tr:nth-child(2n) {
        background-color: #2a2a2a;
      }

      body[theme="dark"].markdown-body img {
        background-color: #1e1e1e;
      }

      body[theme="dark"].markdown-body code {
        background-color: rgba(255,255,255,0.1);
      }

      body[theme="dark"].markdown-body pre>code {
        background-color: transparent;
      }

      body[theme="dark"].markdown-body :checked+.radio-label {
        border-color: #444;
      }

    </style>
    <style id='font'>
      ${buildFontStyle(this.props.fontSize, this.props.fontFamily, this.props.codeBlockFontFamily)}
    </style>
    `
    this.iframe.contentWindow.document.body.className = 'markdown-body'

    this.mountContent()
  }

  componentWillUnmount () {
    this.unmountContent()
  }

  componentDidUpdate (prevProps) {
    // TODO: Rebounce render
    // TODO: Use web worker
    if (prevProps.content !== this.props.content || prevProps.theme !== this.props.theme || prevProps.codeBlockTheme !== this.props.codeBlockTheme) {
      this.unmountContent()
      this.mountContent()
    }

    if (prevProps.fontFamily !== this.props.fontFamily ||
      prevProps.fontSize !== this.props.fontSize ||
      prevProps.codeBlockFontFamily !== this.props.codeBlockFontFamily
    ) {
      this.applyFont()
    }
  }

  handleContentMouseUp = e => {
    this.props.onMouseUp != null && this.props.onMouseUp()
  }

  /**
   * This doesn't do anything for now because `this.props.onMouseDown` is null.
   * But I'll keep this for the further implements. - Sarah Seo
   */
  handleContentMouseDown = e => {
    this.props.onMouseDown != null && this.props.onMouseDown()
  }

  handleAnchorClick = e => {
    e.preventDefault()
    e.stopPropagation()

    const href = e.target.getAttribute('href')

    // Check if the link is internal
    if (/^#(.+)/.test(href)) {
      // If it is, scroll the target element of anchor.
      this.iframe.contentWindow.document.body.scrollTop = this.iframe.contentWindow.document.body.querySelector(href).offsetTop - 10
    } else {
      // Or, open in user's default browser.
      shell.openExternal(e.target.href)
    }
  }

  handleAnchorMouseUp = e => {
    // This will prevent focusing.
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * Mount Content
   *
   * 1. Parse markdown
   * 2. Load theme
   * 3. Queue rewriting tags
   *   - Rewrite math block and inline by katex
   *   - Rewrite codeblock by runmode of codemirror
   * 4. Bind event handlers
   *   - Bind anchor handlers(open the link from user's default browser)
   *     - `click` event : replace default behavior with custom one
   *     - `mouseup` event : block `mouseup` event of content
   *   - Bind content handler
   *     - `mouseup` event : Fire `handlePreviewMouseDown` of MarkdownEditor
   *
   * @memberOf MarkdownPreview
   */
  mountContent () {
    const { content, theme } = this.props
    console.time('mount')
    // Render markdown

    console.time('parse md')
    this.iframe.contentWindow.document.body.innerHTML = markdown.quickRender(content)
    console.timeEnd('parse md')

    console.time('load theme')
    this.iframe.contentWindow.document.body.setAttribute('theme', theme)
    if (this.props.codeBlockTheme !== 'default') {
      this.iframe.contentWindow.document.getElementById('codeMirrorTheme').href = '../../node_modules/codemirror/theme/' + this.props.codeBlockTheme + '.css'
    }
    console.timeEnd('load theme')

    console.time('queue rewriting')
    // Re-render codeblokcs by CodeMirror run mode and Katex
    let codeBlocks = this.iframe.contentWindow.document.body.querySelectorAll('pre code')
    _.forEach(codeBlocks, block => {
      if (block.className === 'math') {
        let value = _.unescape(block.innerHTML)
        let rendered = document.createElement('div')
        block.parentNode.parentNode.replaceChild(rendered, block.parentNode)
        rendered.className = 'katex'
        rendered.title = value.trim()
        rendered.innerHTML = katex.renderToString(value)
        return
      }
      let syntax = parseMode(block.className.substring(9))

      CodeMirror.requireMode(syntax.mode, () => {
        let value = _.unescape(block.innerHTML)
        block.innerHTML = ''
        block.parentNode.className = ` cm-s-${this.props.codeBlockTheme} CodeMirror`
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
      rendered.title = value.trim()
      rendered.innerHTML = katex.renderToString(value)
    })
    console.timeEnd('queue rewriting')

    console.time('bind event handler')
    // Apply click handler for switching mode
    this.iframe.contentWindow.document.addEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.addEventListener('mousedown', this.handleContentMouseDown)
    _.forEach(this.iframe.contentWindow.document.body.querySelectorAll('a'), anchor => {
      anchor.addEventListener('mouseup', this.handleAnchorMouseUp)
      anchor.addEventListener('click', this.handleAnchorClick)
    })
    console.timeEnd('bind event handler')

    console.timeEnd('mount')
  }

  /**
   * Unmount Content
   *
   * Unbind event handlers
   * - Unbind anchor handlers
   * - Unbind content handler
   *
   * @memberOf MarkdownPreview
   */
  unmountContent () {
    // Remove click handler before rewriting.
    this.iframe.contentWindow.document.removeEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.removeEventListener('mousedown', this.handleContentMouseDown)
    _.forEach(this.iframe.contentWindow.document.body.querySelectorAll('a'), anchor => {
      anchor.removeEventListener('mouseup', this.handleAnchorMouseUp)
      anchor.removeEventListener('click', this.handleAnchorClick)
    })
  }

  applyFont () {
    this.iframe.contentWindow.document.getElementById('font').innerHTML = buildFontStyle(this.props.fontSize, this.props.fontFamily, this.props.codeBlockFontFamily)
  }

  findAnchor (target) {
    while (target) {
      if (target.nodeName === 'A') {
        return target
      }
      target = target.parentNode
    }
    return null
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
