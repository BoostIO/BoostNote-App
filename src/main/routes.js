import React from 'react'
import { Route, IndexRedirect } from 'react-router'

import Main from './Main'

const routes = (
  <Route path='/' component={Main}>

    <IndexRedirect to='storages/Notebook' />

    <Route path='storages/:storageName'>
      <IndexRedirect to='all-notes' />
      <Route path='all-notes' />
      <Route path='settings' />
      <Route path='folders/:folderName' />
      <Route path='tags/:tagName' />
    </Route>

    <Route path='new-storage' />

  </Route>
)

export default routes
