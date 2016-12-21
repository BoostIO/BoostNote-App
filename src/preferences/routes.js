import React from 'react'
import { Route, IndexRedirect } from 'react-router'

import Main from './Main'

const routes = (
  <Route path='/' component={Main}>

    <IndexRedirect to='tabs/settings' />

    <Route path='tabs/:tab' />
  </Route>
)

export default routes
