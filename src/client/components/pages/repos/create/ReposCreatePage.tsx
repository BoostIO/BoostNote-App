import * as React from 'react'
import CreateFormContainer from './CreateFormContainer'

import { bindActionCreators } from 'redux'
import {
  connect,
  Dispatch,
} from 'react-redux'
import {
  State,
  Pages
} from 'client/redux'

const ReposCreatePage = () => (
  <div>
    <div>Create a new repo</div>
    <CreateFormContainer />
  </div>
)

export default ReposCreatePage
