import * as React from 'react'
import { connect } from 'react-redux'
import { Actions, State } from 'client/redux'
import { getRepositoryName, getNoteId } from './selectors'
import Types from 'client/Types'
import { throttle } from 'lodash-es'
import { branch, renderNothing } from 'recompose'

interface NoteDetailStateProps {
  note: Types.Note
  repositoryName: string
  noteId: string
}

type NoteDetailProps = NoteDetailStateProps & typeof mapDispatchToProps

interface NoteDetailState {
  content: string
}

class NoteDetail extends React.Component<NoteDetailProps, NoteDetailState> {
  public content: HTMLTextAreaElement

  constructor (props: NoteDetailProps) {
    super(props)

    this.state = {
      content: props.note ? props.note.content : ''
    }
  }

  public componentWillReceiveProps (nextProps: NoteDetailProps) {
    const isNoteSwitched = this.props.noteId !== nextProps.noteId
    if (isNoteSwitched) {
      this.throttleUpdateNote.flush()
      this.setState({
        content: nextProps.note.content
      })
    }
  }

  public updateContent = () => {
    this.setState({
      content: this.content.value
    }, () => {
      const { note, repositoryName, noteId } = this.props
      const { content } = this.state

      this.throttleUpdateNote(repositoryName, noteId, content)
    })
  }

  public throttleUpdateNote = throttle((repositoryName: string, noteId: string, content: string) => {
    const {
      updateNote,
    } = this.props

    updateNote({
      repositoryName,
      noteId,
      content,
    })
  }, 1000)

  public render () {
    return (
      <div>
        <textarea
          ref={(content) => this.content = content}
          value={this.state.content}
          onChange={this.updateContent}
        />
      </div>
    )
  }
}

const mapDispatchToProps = {
  updateNote: Actions.Pages.ReposShow.ActionCreators.updateNote
}

const mapStateToProps = (state: State): NoteDetailStateProps => {
  const repositoryName = getRepositoryName(state)
  const repository = state.repositoryMap.get(repositoryName)
  const noteId = getNoteId(state)
  const note = repository.noteMap.get(noteId)

  return {
    repositoryName,
    noteId,
    note,
  }
}

const renderNothingIfNoteDoesExist = branch((props: NoteDetailProps) => !props.note, renderNothing)

export default connect(mapStateToProps, mapDispatchToProps)(renderNothingIfNoteDoesExist(NoteDetail))
