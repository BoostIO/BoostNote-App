import React from 'react'
import { parseBoolean } from '../../../lib/utils/string'
import { BlockPropertyProps } from './types'

const CheckboxCell = ({ value, onUpdate }: BlockPropertyProps) => {
  return (
    <div>
      <input
        onChange={(ev) => onUpdate(ev.target.checked ? 'true' : 'false')}
        type='checkbox'
        checked={parseBoolean(value)}
      />
    </div>
  )
}

export default CheckboxCell
