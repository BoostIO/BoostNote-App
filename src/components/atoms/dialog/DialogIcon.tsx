import React from 'react'
import { DialogIconTypes } from '../../../lib/dialog'
import styled from '../../../lib/styled'

export const StyledIcon = styled.div`
  font-size: 70px;
  line-height: 100%;
  margin-right: 15px;
`
type DialogIconProps = {
  icon: DialogIconTypes
}

const DialogIcon = ({ icon }: DialogIconProps) => (
  <StyledIcon>{getEmoji(icon)}</StyledIcon>
)

export default DialogIcon

function getEmoji(icon: DialogIconTypes): string {
  switch (icon) {
    case DialogIconTypes.Info:
      return 'ℹ️'
    case DialogIconTypes.Question:
      return '❓'
    case DialogIconTypes.Warning:
      return '⚠️'
    case DialogIconTypes.Error:
      return '🚨'
    default:
      return '👻'
  }
}
