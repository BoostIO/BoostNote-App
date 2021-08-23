import React from 'react'
import { Emoji } from 'emoji-mart'
import cc from 'classcat'
import Flexbox from '../../design/components/atoms/Flexbox'
import WithTooltip from '../../design/components/atoms/WithTooltip'
import Icon, { IconSize } from '../../design/components/atoms/Icon'

interface EmojiIconProps {
  emoji?: string
  defaultIcon?: string
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  size?: IconSize
  tooltip?: React.ReactNode
}

const EmojiIcon = ({
  emoji,
  defaultIcon,
  className,
  style,
  size = 34,
  tooltip,
  onClick,
}: EmojiIconProps) => {
  if (emoji == null && defaultIcon == null) {
    return null
  }

  return (
    <Flexbox
      style={{ marginRight: 5, cursor: 'pointer', ...style }}
      flex={'0 0 auto'}
      className={cc([onClick != null && 'button', className])}
      onClick={onClick}
    >
      <WithTooltip tooltip={tooltip}>
        {emoji != null ? (
          <Emoji emoji={emoji} set='apple' size={size} />
        ) : (
          <Icon path={defaultIcon!} size={size} />
        )}
      </WithTooltip>
    </Flexbox>
  )
}

export default EmojiIcon
