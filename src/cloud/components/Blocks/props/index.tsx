import React from 'react'
import { PropType } from '../../../lib/blocks/props'
import TextProp from './TextProp'
import CheckboxProp from './CheckboxProp'
import DateProp from './DateProp'
import BoostUserProp from './BoostUserProp'
import { isNumberString, isUrlOrPath } from '../../../lib/utils/string'
import { mdiExclamationThick, mdiLinkVariant } from '@mdi/js'

interface BlockPropProps {
  type: PropType
  value: string
  currentUserIsCoreMember: boolean
  onChange: (value: string) => void
}
const BlockProp = ({
  type,
  value,
  onChange,
  currentUserIsCoreMember,
}: BlockPropProps) => {
  switch (type) {
    case 'number':
      return (
        <TextProp
          currentUserIsCoreMember={currentUserIsCoreMember}
          value={value}
          onUpdate={onChange}
          validation={isNumberString}
          placeholder='...'
        />
      )
    case 'date':
      return (
        <DateProp
          value={value}
          onUpdate={onChange}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      )
    case 'url':
      return (
        <TextProp
          value={value}
          onUpdate={onChange}
          currentUserIsCoreMember={currentUserIsCoreMember}
          placeholder={'url..'}
          controls={
            value.trim() === ''
              ? undefined
              : isUrlOrPath(value)
              ? [
                  {
                    iconPath: mdiLinkVariant,
                    onClick: () => window.open(value, '_blank'),
                  },
                ]
              : [
                  {
                    iconPath: mdiExclamationThick,
                    disabled: true,
                    tooltip: 'Format of the link is incorrect',
                  },
                ]
          }
        />
      )
    case 'checkbox':
      return (
        <CheckboxProp
          value={value}
          onUpdate={onChange}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      )
    case 'user':
      return (
        <BoostUserProp
          value={value}
          onUpdate={onChange}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      )
    case 'text':
    default:
      return (
        <TextProp
          value={value}
          onUpdate={onChange}
          placeholder='...'
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      )
  }
}

export default BlockProp
