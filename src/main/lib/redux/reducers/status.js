import _ from 'lodash'
import { DEFAULT_STATUS } from 'lib/consts'

let storedStatus
try {
  storedStatus = JSON.parse(window.localStorage.getItem('status'))
  if (!_.isObject(storedStatus)) throw new Error('Status data should be an object.')
} catch (err) {
  console.warn(err.stack)
  storedStatus = {}
}

const initialStatus = DEFAULT_STATUS.merge(storedStatus)

function status (state = initialStatus, action) {
  switch (action.type) {
    case 'UPDATE_STATUS':
      const newStatus = state.merge(action.payload.status)

      // TODO: this should be extracted to redux saga middleware
      window.localStorage.setItem('status', JSON.stringify(newStatus.toJS()))

      return newStatus
  }
  return state
}

export default status
