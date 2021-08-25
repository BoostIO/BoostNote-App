import React from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import WithTooltip from '../../../../design/components/atoms/WithTooltip'
import {
  ContentManagerRowAction,
  UnsignedItem,
} from '../../../interfaces/components/ContentManager/types'

interface RowActionProps<T extends UnsignedItem> {
  action: ContentManagerRowAction<T>
  item: T
  sending?: boolean
  disabled?: boolean
}

const RowActionButton = <T extends UnsignedItem>({
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

export default RowActionButton
