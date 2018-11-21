import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../../stores/DataStore'

type NoteListProps = {
  data?: DataStore
}

type NoteListState = {}

@inject('data')
@observer
export default class NoteList extends React.Component<
  NoteListProps,
  NoteListState
> {
  render() {
    return <div>Note List</div>
  }
}
