import React from 'react'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'

type NotePageProps = {}

type NotePageState = {}

export default class NotePage extends React.Component<
  NotePageProps,
  NotePageState
> {
  render() {
    return (
      <>
        <NoteList />
        <NoteDetail />
      </>
    )
  }
}
