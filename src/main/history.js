import store from './lib/redux/store'
import { hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

const history = syncHistoryWithStore(hashHistory, store)

export default history
