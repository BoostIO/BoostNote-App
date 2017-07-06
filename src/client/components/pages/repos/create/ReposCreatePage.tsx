import * as React from 'react'
import ReposCreateForm from './ReposCreateForm'

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
    <ReposCreateForm />
  </div>
)

export default ReposCreatePage
