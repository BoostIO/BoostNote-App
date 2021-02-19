import React, { useMemo } from 'react'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../../interfaces/db/folder'
import Tooltip from '../../../atoms/Tooltip'
import IconMdi from '../../../atoms/IconMdi'
import { Spinner } from '../../../atoms/Spinner'
import { StyledRowActionIcon } from '../styled'

export type UnsignedItem =
  | SerializedDocWithBookmark
  | SerializedFolderWithBookmark

export type ContentManagerRowAction<T extends UnsignedItem> = {
  iconPath: string
  tooltip?: string
  id: number
  onClick: (item: T) => void
}

interface RowActionProps<T extends UnsignedItem> {
  action: ContentManagerRowAction<T>
  item: T
  sending?: boolean
  disabled?: boolean
}

const RowAction = <T extends UnsignedItem>({
  action,
  item,
  disabled,
  sending = false,
}: RowActionProps<T>) => {
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
          onClick={() => action.onClick(item)}
          disabled={disabled}
        >
          {icon}
        </StyledRowActionIcon>
      </Tooltip>
    )
  }

  return (
    <StyledRowActionIcon
      onClick={() => action.onClick(item)}
      disabled={disabled}
    >
      {icon}
    </StyledRowActionIcon>
  )
}

export default RowAction
