import React from 'react'
import { Emoji } from 'emoji-mart'
import cc from 'classcat'
import Flexbox from '../../design/components/atoms/Flexbox'
import { IconSize } from '../../design/components/atoms/Icon'
import WithDelayedTooltip from '../../design/components/atoms/WithDelayedTooltip'

interface EmojiIconProps {
  emoji: string
  defaultIcon?: string
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  size?: IconSize
  tooltip?: React.ReactNode
  emojiTextContent?: React.ReactNode
  tooltipDelay: number
  tooltipSide?: 'right' | 'bottom' | 'bottom-right' | 'top'
}

const CommentEmoji = ({
  emoji,
  defaultIcon,
  className,
  style,
  size = 34,
  tooltip,
  tooltipDelay = 0,
  onClick,
  emojiTextContent,
  tooltipSide,
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
      <WithDelayedTooltip
        tooltip={tooltip}
        tooltipDelay={tooltipDelay}
        side={tooltipSide}
      >
        <Flexbox direction={'row'}>
          <Emoji emoji={emoji} set='apple' size={size} />
          {emojiTextContent != null && emojiTextContent}
        </Flexbox>
      </WithDelayedTooltip>
    </Flexbox>
  )
}

export default CommentEmoji
