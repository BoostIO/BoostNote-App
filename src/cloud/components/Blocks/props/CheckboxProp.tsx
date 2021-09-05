import React from 'react'
import { parseBoolean } from '../../../lib/utils/string'
import { BlockPropertyProps } from './types'
import Checkbox from '../../../../design/components/molecules/Form/atoms/FormCheckbox'

const CheckboxProp = ({ value, onUpdate }: BlockPropertyProps) => {
  return (
    <div>
      <Checkbox
        toggle={() => onUpdate(parseBoolean(value) === true ? 'false' : 'true')}
        checked={parseBoolean(value)}
      />
    </div>
  )
}

export default CheckboxProp
