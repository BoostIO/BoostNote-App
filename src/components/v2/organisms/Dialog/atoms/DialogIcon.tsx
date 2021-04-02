import React from 'react'
import { DialogIconTypes } from '../../../../../lib/v2/stores/dialog'
import cc from 'classcat'

type DialogIconProps = {
  icon: DialogIconTypes
  className?: string
}

const DialogIcon = ({ className, icon }: DialogIconProps) => (
  <div className={cc(['dialog__icon', className])}>{getEmoji(icon)}</div>
)

export default DialogIcon

function getEmoji(icon: DialogIconTypes): string {
  switch (icon) {
    case DialogIconTypes.Question:
      return '❓'
    case DialogIconTypes.Warning:
    default:
      return '⚠️'
  }
}
