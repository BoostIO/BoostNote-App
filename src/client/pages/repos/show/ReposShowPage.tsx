import * as React from 'react'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import { style } from 'typestyle'

const className = style({
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  $nest: {
    '&>.list': {
    },
    '&>.handler': {
      width: 1,
      background: 'grey',
    },
    '&>.detail': {
      flex: 1,
    },
  },
})

const ReposShowPage = () => (
  <div className={className}>
    <div className='list' style={{width: 150}}>
      <NoteList/>
    </div>

    <div className='handler'/>

    <div className='detail'>
      <NoteDetail/>
    </div>
  </div>
)

export default ReposShowPage
