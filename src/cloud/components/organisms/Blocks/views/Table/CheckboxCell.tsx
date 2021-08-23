import React from 'react'
import { CellProps } from '.'
import { parseBoolean } from '../../../../../lib/utils/string'

const CheckboxCell = ({ value, onUpdate }: CellProps) => {
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
