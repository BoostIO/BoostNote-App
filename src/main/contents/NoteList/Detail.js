import React, { PropTypes } from 'react'
import styled from 'styled-components'
import TagSelect from './TagSelect'
import moment from 'moment'
import MarkdownEditor from 'components/MarkdownEditor'
import StorageManager from 'main/lib/StorageManager'
import { Set } from 'immutable'
import markdown from 'lib/markdown'

const Root = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const StatusBar = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
`

const StatusBarLeft = styled.div`
  flex: 1;
  padding: 0 10px;
  overflow-x: auto;
`

const StatusBarRight = styled.div`
  font-size: 12px;
  line-height: 30px;
  color: ${p => p.theme.inactiveColor};
  padding: 0 10px;
`

const BodyEditor = styled(MarkdownEditor)`
  position: relative;
  flex: 1;
`
class Detail extends React.Component {
  constructor (props) {
    super(props)

    let { note } = props

    this.state = {
      tags: note.get('tags'),
      content: note.get('content')
    }

    this.queueTimer = null
  }

  handleContentChange = e => {
    this.setState({
      content: this.editor.value
    }, () => {
      this.setDispatchTimer()
    })
  }

  handleTagChange = newTags => {
    this.setState({
      tags: newTags
    }, () => {
      this.setDispatchTimer()
    })
  }

  dispatchUpdate () {
    const { noteKey, note } = this.props
    const { router, store } = this.context

    const isContentChanged = note.get('content') !== this.state.content
    const areTagsChanged = !note.get('tags').equals(new Set(this.state.tags))

    if (noteKey == null || (!isContentChanged && !areTagsChanged)) {
      return false
    }

    const parsed = markdown.parse(this.state.content)
    const meta = {
      title: parsed.data.title,
      preview: parsed.data.preview
    }

    const input = {
      meta,
      tags: this.state.tags.toArray(),
      content: this.state.content
    }

    StorageManager
      .updateNote(router.params.storageName, noteKey, input)
      .then(res => {
        store.dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            storageName: router.params.storageName,
            noteId: res.id,
            note: res.note
          }
        })
      })
  }

  setDispatchTimer () {
    this.invalidateDispatchTimer()
    this.queueTimer = window.setTimeout(() => {
      this.queueTimer = null
      this.dispatchUpdate()
    }, 1000)
  }

  invalidateDispatchTimer () {
    window.clearTimeout(this.queueTimer)
  }

  componentWillReceiveProps (nextProps) {
    const nextNoteKey = nextProps.noteKey
    const { noteKey } = this.props

    // Note changed
    if (nextNoteKey !== noteKey) {
      if (noteKey != null) {
        this.dispatchUpdate()
      }

      this.tagSelect.resetInput()
      this.setState({
        tags: new Set(nextProps.note.get('tags')),
        content: nextProps.note.get('content')
      })
    }
  }

  componentWillUnmount () {
    if (this.queueTimer != null) {
      this.dispatchUpdate()
    }
  }

  focusEditor () {
    this.editor.focus()
  }

  render () {
    const { note, noteKey } = this.props
    const { router } = this.context

    return (
      <Root>
        <StatusBar>
          <StatusBarLeft>
            <TagSelect
              ref={c => (this.tagSelect = c)}
              value={this.state.tags}
              onChange={this.handleTagChange}
            />
          </StatusBarLeft>
          <StatusBarRight>{moment(note.get('updatedAt')).fromNow()}</StatusBarRight>
        </StatusBar>
        <BodyEditor
          innerRef={c => (this.editor = c)}
          value={this.state.content}
          onChange={this.handleContentChange}
          docKey={`${router.params.storageName}/${noteKey}`}
          codeEditorStyle={p => `border-top: ${p.theme.border};`}
        />
      </Root>
    )
  }
}

Detail.propTypes = {
  noteKey: PropTypes.string,
  note: PropTypes.shape({
  })
}

Detail.contextTypes = {
  router: PropTypes.shape({
    location: PropTypes.shape()
  }),
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

export default Detail
