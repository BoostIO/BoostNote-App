import React, { MouseEventHandler } from 'react'
import Button from '../../shared/components/atoms/Button'
import WithTooltip from '../../shared/components/atoms/WithTooltip'

interface FolderDetailListItemControlButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  iconPath: string
  title?: string
  active?: boolean
}

const FolderDetailListItemControlButton = ({
  onClick,
  title,
  iconPath,
  active = false,
}: FolderDetailListItemControlButtonProps) => {
  return (
    <WithTooltip tooltip={title} side='bottom'>
      <Button
        variant={'icon-secondary'}
        iconSize={20}
        size={'sm'}
        iconPath={iconPath}
        active={active}
        onClick={onClick}
      />
    </WithTooltip>
  )
}

export default FolderDetailListItemControlButton
