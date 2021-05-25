import React, { useCallback } from 'react'
import { SideNavIconStyle } from './styled'
import IconMdi from '../../../atoms/IconMdi'
import Tooltip from '../../../atoms/Tooltip'
import { SerializedFolder } from '../../../../interfaces/db/folder'
import { SerializedDoc } from '../../../../interfaces/db/doc'
import { Emoji } from 'emoji-mart'
import cc from 'classcat'
import { useEmoji } from '../../../../../shared/lib/stores/emoji'

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
  className,
  size = 16,
}: SideNavIconProps) => {
  const { openEmojiPicker } = useEmoji()

  const onClickHandler = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      openEmojiPicker(event, () => {
        console.log('unhandled')
      })
    },
    [openEmojiPicker]
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
