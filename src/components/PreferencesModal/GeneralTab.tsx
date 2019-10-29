import React from 'react'
import Icon from '../atoms/Icon'
import { mdiPlus } from '@mdi/js'

const GeneralTab = () => {
  return (
    <div>
      <div>
        <div>
          <h1>Accounts</h1>
          <button>
            <Icon path={mdiPlus} />
            Add Another Account
          </button>
        </div>
        <div>Account list</div>
      </div>
      <div>
        <h1>Interface Language</h1>
        <div>
          <select>
            <option>English</option>
            <option>Japanese</option>
          </select>
        </div>
      </div>
      <div>
        <h1>Application Theme</h1>
        <div>
          <select>
            <option>Light</option>
            <option>Dark</option>
            <option>Solarized Dark</option>
          </select>
        </div>
      </div>
      <div>
        <h1>Note Sorting</h1>
        <div>
          <select>
            <option>Date Updated</option>
            <option>Date Created</option>
            <option>Title</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
