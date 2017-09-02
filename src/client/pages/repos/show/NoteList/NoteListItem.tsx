import * as React from 'react'
import { Link } from 'client/shared'
import Types from 'client/types'

interface NoteListItemProps {
  repositoryName: string
  noteId: string
  note: Types.Note
}

class NoteListItem extends React.PureComponent<NoteListItemProps> {
  public render () {
    const {
      repositoryName,
      note,
      noteId,
    } = this.props

    return (
      <div>
        <Link href={`/repos/${repositoryName}/notes/${noteId}`}>{noteId}</Link>
      </div>
    )
  }
}

export default NoteListItem
