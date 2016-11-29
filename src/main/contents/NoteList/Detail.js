import React, { PropTypes } from 'react'
import styled from 'styled-components'
import TagSelect from './TagSelect'
import moment from 'moment'
import MarkdownEditor from 'components/MarkdownEditor'
import StorageManager from 'main/lib/StorageManager'
import { Map, Set } from 'immutable'

const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const StatusBar = styled.div`
  width: 100%;
  height: 30px;
  border-bottom: ${p => p.theme.border};
  display: flex;
`

const StatusBarLeft = styled.div`
  flex: 1;
`

const StatusBarRight = styled.div`
  font-size: 12px;
  line-height: 30px;
  color: ${p => p.theme.inactiveColor}
  padding: 0 5px;
`

const BodyEditor = styled(MarkdownEditor)`
  position: relative;
  flex: 1;
`

const defaultNote = {
  tags: [],
  content: ''
}

class Detail extends React.Component {
  constructor (props) {
    super(props)

    let { note } = props
    if (note == null) note = defaultNote

    this.state = {
      tags: new Set(note.tags),
      content: note.content
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

  dispatchUpdate () {
    const { noteKey, note } = this.props
    const { router, store } = this.context

    const isContentChanged = note.get('content') !== this.state.content
    const areTagsChanged = !note.get('tags').equals(new Set(this.state.tags))

    if (!isContentChanged && !areTagsChanged) {
      return false
    }

    const input = {
      tags: new Set(this.state.tags),
      content: this.state.content
    }

    StorageManager
      .updateNote(router.params.storageName, noteKey, input)
      .then(() => {
        store.dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            storageName: router.params.storageName,
            noteId: noteKey,
            note: new Map(Object.assign({}, note.toJS(), input, {
              updatedAt: new Date()
            }))
          }
        })
      })
  }

  setDispatchTimer () {
    this.invalidateDispatchTimer()
    this.queueTimer = window.setTimeout(() => {
      this.queueTimer = null
      this.dispatchUpdate()
    }, 1500)
  }

  invalidateDispatchTimer () {
    window.clearTimeout(this.queueTimer)
  }

  componentWillReceiveProps (nextProps) {
    const nextNoteKey = nextProps.noteKey
    const { noteKey } = this.props
    if (nextNoteKey !== noteKey) {
      if (noteKey != null) {
        this.dispatchUpdate()
      }
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

  render () {
    const { note } = this.props

    if (note == null) return <div>No note.</div>

    return (
      <Root>
        <StatusBar>
          <StatusBarLeft>
            <TagSelect value={note.get('tags')} />
          </StatusBarLeft>
          <StatusBarRight>{moment(note.get('updatedAt')).fromNow()}</StatusBarRight>
        </StatusBar>
        <BodyEditor
          innerRef={c => (this.editor = c)}
          value={this.state.content}
          onChange={this.handleContentChange}
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
