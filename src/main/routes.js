import React from 'react'
import { Route, IndexRedirect } from 'react-router'

import Main from './Main'
import StorageIndex from './contents/StorageIndex'
import NoteList from './contents/NoteList'
import StorageCreate from './contents/StorageCreate'

const routes = (
  <Route path='/' component={Main}>

    <IndexRedirect to='home' />
    <Route path='home' component={NoteList} />

    <Route path='storages/:storageId'>
      <IndexRedirect to='all-notes' />
      <Route path='all-notes' component={NoteList} />
      <Route path='settings' component={StorageIndex} />
      <Route path='folders/:folderId' component={NoteList} />
    </Route>

    <Route path='new-storage' component={StorageCreate} />

  </Route>
)

export default routes
