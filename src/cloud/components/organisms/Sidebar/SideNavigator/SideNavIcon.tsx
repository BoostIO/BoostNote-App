import React, { useCallback } from 'react'
import { SideNavIconStyle } from './styled'
import IconMdi from '../../../atoms/IconMdi'
import Tooltip from '../../../atoms/Tooltip'
import { useEmojiPicker } from '../../../../lib/stores/emoji'
import { SerializedFolder } from '../../../../interfaces/db/folder'
import { SerializedDoc } from '../../../../interfaces/db/doc'
import { Emoji } from 'emoji-mart'
import cc from 'classcat'

export type EmojiPickerDoc = {
  type: 'doc'
  item: SerializedDoc
}

export type EmojiPickerFolder = {
  type: 'folder'
  item: SerializedFolder
}

export type EmojiResource = EmojiPickerDoc | EmojiPickerFolder

type SideNavIconProps = {
  mdiPath: string
  className?: string
  size?: number
} & (EmojiPickerDoc | EmojiPickerFolder)

const SideNavIcon = ({
  mdiPath,
  item,
  type,
  className,
  size = 16,
}: SideNavIconProps) => {
  const { openEmojiPicker } = useEmojiPicker()

  const onClickHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      openEmojiPicker(event, { item, type } as EmojiResource)
    },
    [item, type, openEmojiPicker]
  )

  return (
    <SideNavIconStyle
      className={cc(['emoji-icon', className])}
      onClick={onClickHandler}
      style={{ width: size + 4 }}
    >
      <Tooltip tooltip='Icon'>
        {item.emoji != null ? (
          <Emoji emoji={item.emoji} set='apple' size={size} />
        ) : (
          <IconMdi path={mdiPath} size={size} />
        )}
      </Tooltip>
    </SideNavIconStyle>
  )
}

export default SideNavIcon
