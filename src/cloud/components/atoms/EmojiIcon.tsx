import React from 'react'
import { Emoji } from 'emoji-mart'
import IconMdi from './IconMdi'
import Flexbox from './Flexbox'
import cc from 'classcat'
import Tooltip from './Tooltip'

interface EmojiIconProps {
  emoji?: string
  defaultIcon?: string
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  size?: number
  tooltip?: React.ReactNode
}

const EmojiIcon = ({
  emoji,
  defaultIcon,
  className,
  style,
  size = 32,
  tooltip,
  onClick,
}: EmojiIconProps) => {
  if (emoji == null && defaultIcon == null) {
    return null
  }

  if (tooltip != null) {
    return (
      <Flexbox
        style={{ marginRight: 5, ...style }}
        grow={0}
        shrink={0}
        className={cc([onClick != null && 'button', className])}
        onClick={onClick}
      >
        <Tooltip tooltip={tooltip}>
          {emoji != null ? (
            <Emoji emoji={emoji} set='apple' size={size} />
          ) : (
            <IconMdi path={defaultIcon!} size={size} />
          )}
        </Tooltip>
      </Flexbox>
    )
  }

  return (
    <Flexbox
      style={{ marginRight: 5, ...style }}
      grow={0}
      shrink={0}
      className={cc([onClick != null && 'button', className])}
      onClick={onClick}
    >
      {emoji != null ? (
        <Emoji emoji={emoji} set='apple' size={size} />
      ) : (
        <IconMdi path={defaultIcon!} size={size} />
      )}
    </Flexbox>
  )
}

export default EmojiIcon
