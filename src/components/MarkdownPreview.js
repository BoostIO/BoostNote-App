import React, { PropTypes } from 'react'
import markdown from 'lib/markdown'

class MarkdownPreview extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount () {
    this.mountContent()
  }

  componentWillUnmount () {
    this.unmountContent()
  }

  componentDidUpdate (prevProps) {
    this.unmountContent()
    this.mountContent()
  }

  mountContent () {
    const { content } = this.props

    this.iframe.contentWindow.document.body.innerHTML = markdown.parse(content)

    this.iframe.contentWindow.document.addEventListener('mouseup', this.handleContentMouseUp)
    this.iframe.contentWindow.document.addEventListener('mousedown', this.handleContentMouseDown)
  }

  unmountContent () {
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
      />
    )
  }
}

MarkdownPreview.propTypes = {
  content: PropTypes.string
}

export default MarkdownPreview
