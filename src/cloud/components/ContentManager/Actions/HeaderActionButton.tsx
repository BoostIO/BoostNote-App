import React from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import WithTooltip from '../../../../design/components/atoms/WithTooltip'

type ContentManagerHeaderAction = {
  iconPath: string
  tooltip?: string
  onClick: () => void
}

interface HeaderActionButtonProps {
  action: ContentManagerHeaderAction
  sending?: boolean
  disabled?: boolean
}

const HeaderActionButton = ({
  action,
  disabled,
  sending = false,
}: HeaderActionButtonProps) => {
  if (action.tooltip != null) {
    return (
      <WithTooltip tooltip={action.tooltip}>
        <LoadingButton
          variant='icon'
          iconSize={20}
          iconPath={action.iconPath}
          onClick={action.onClick}
          disabled={disabled}
          className='valign-super'
          spinning={sending}
        />
      </WithTooltip>
    )
  }

  return (
    <LoadingButton
      variant='icon'
      iconSize={20}
      iconPath={action.iconPath}
      onClick={action.onClick}
      disabled={disabled}
      className='valign-super'
      spinning={sending}
    />
  )
}

export default HeaderActionButton
