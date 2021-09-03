import React from 'react'
import { PropType } from '../../../lib/blocks/props'
import TextProp from './TextProp'
import CheckboxProp from './CheckboxProp'
import DateProp from './DateProp'
import BoostUserProp from './BoostUserProp'
import { isNumberString, isUrlOrPath } from '../../../lib/utils/string'

interface BlockPropProps {
  type: PropType
  value: string
  onChange: (value: string) => void
}
const BlockProp = ({ type, value, onChange }: BlockPropProps) => {
  switch (type) {
    case 'number':
      return (
        <TextProp
          value={value}
          onUpdate={onChange}
          validation={isNumberString}
        />
      )
    case 'date':
      return <DateProp value={value} onUpdate={onChange} />
    case 'url':
      return (
        <TextProp value={value} onUpdate={onChange} validation={isUrlOrPath} />
      )
    case 'checkbox':
      return <CheckboxProp value={value} onUpdate={onChange} />
    case 'user':
      return <BoostUserProp value={value} onUpdate={onChange} />
    case 'text':
    default:
      return <TextProp value={value} onUpdate={onChange} />
  }
}

export default BlockProp
