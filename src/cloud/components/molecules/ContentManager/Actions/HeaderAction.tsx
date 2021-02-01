import React, { useMemo } from 'react'
import Tooltip from '../../../atoms/Tooltip'
import IconMdi from '../../../atoms/IconMdi'
import { Spinner } from '../../../atoms/Spinner'
import { StyledRowActionIcon } from '../styled'

type ContentManagerHeaderAction = {
  iconPath: string
  tooltip?: string
  onClick: () => void
}

interface HeaderActionProps {
  action: ContentManagerHeaderAction
  sending?: boolean
  disabled?: boolean
}

const HeaderAction = ({
  action,
  disabled,
  sending = false,
}: HeaderActionProps) => {
  const icon = useMemo(() => {
    if (sending) {
      return (
        <Spinner size={18} className='relative' style={{ left: 0, top: 0 }} />
      )
    }

    return <IconMdi path={action.iconPath} className='action' size={20} />
  }, [action.iconPath, sending])

  if (action.tooltip != null) {
    return (
      <Tooltip tooltip={action.tooltip}>
        <StyledRowActionIcon
          onClick={action.onClick}
          disabled={disabled}
          className='valign-super'
        >
          {icon}
        </StyledRowActionIcon>
      </Tooltip>
    )
  }

  return (
    <StyledRowActionIcon
      onClick={action.onClick}
      disabled={disabled}
      className='valign-super'
    >
      {icon}
    </StyledRowActionIcon>
  )
}

export default HeaderAction
