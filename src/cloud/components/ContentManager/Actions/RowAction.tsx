import React from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import WithTooltip from '../../../../design/components/atoms/WithTooltip'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'

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
  if (action.tooltip != null) {
    return (
      <WithTooltip tooltip={action.tooltip}>
        <LoadingButton
          variant='icon'
          iconSize={20}
          iconPath={action.iconPath}
          spinning={sending}
          onClick={() => action.onClick(item)}
          disabled={disabled}
        />
      </WithTooltip>
    )
  }

  return (
    <LoadingButton
      variant='icon'
      iconSize={20}
      iconPath={action.iconPath}
      spinning={sending}
      onClick={() => action.onClick(item)}
      disabled={disabled}
    />
  )
}

export default RowAction
