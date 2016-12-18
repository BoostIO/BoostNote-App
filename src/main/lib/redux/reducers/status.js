import { Map } from 'immutable'
import _ from 'lodash'

const defaultStatus = Map({
  navWidth: 150,
  noteListWidth: 200,
  // NORMAL, COMPACT
  noteListStyle: 'NORMAL',
  // UPDATED_AT, CREATED_AT, ALPHABET
  noteListSort: 'UPDATED_AT'
})

let storedStatus
try {
  storedStatus = JSON.parse(window.localStorage.getItem('status'))
  if (!_.isObject(storedStatus)) throw new Error('Status data should be an object.')
} catch (err) {
  console.warn(err.stack)
  storedStatus = {}
}

const initialStatus = defaultStatus.merge(storedStatus)

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
