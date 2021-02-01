import React, { useState } from 'react'
import styled from '../../lib/styled'

interface TooltipProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  side?: 'top' | 'left' | 'right' | 'bottom' | 'bottom-right'
  tooltip: React.ReactNode
  tagName?: 'span' | 'div' | 'p' | 'li'
  key?: string | number
}

const Tooltip = ({
  children,
  tooltip,
  style,
  className,
  tagName = 'div',
  key,
  side = 'bottom',
}: TooltipProps) => {
  const [open, setOpen] = useState(false)

  const Tag = tagName

  return (
    <Tag
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(false)}
      style={{ position: 'relative', cursor: 'pointer' }}
      className={className}
      key={key}
    >
      {children}
      {open && (
        <StyledTooltip style={style} className={side}>
          <div className='tooltip-base'>
            <span>{tooltip}</span>
          </div>
        </StyledTooltip>
      )}
    </Tag>
  )
}

export default Tooltip

const StyledTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  margin-top: 9px;
  width: max-content;
  min-width: 40px;
  text-align: center;

  &.top {
    top: initial;
    bottom: 120%;

    &::after {
      border-bottom: 0;
      border-top: 9px solid ${({ theme }) => theme.subtleIconColor};
      bottom: -9px;
      top: initial;
    }
  }

  &.bottom-right {
    left: 100%;
    transform: translateX(-20%);
  }

  > div {
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
    padding: ${({ theme }) => theme.space.xxsmall}px
      ${({ theme }) => theme.space.xsmall}px;
    border: 1px solid ${({ theme }) => theme.secondaryBorderColor};
    border-radius: 5px;
    font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
    color: ${({ theme }) => theme.baseTextColor};

    .tooltip-text {
      background-color: none;
      padding-right: ${({ theme }) => theme.space.default}px;
    }

    .tooltip-command {
      display: inline-block;
      line-height: 18px;
      padding: 0 ${({ theme }) => theme.space.xxsmall}px;
      border-radius: 2px;
      border: 1px solid ${({ theme }) => theme.secondaryBorderColor};
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }
`
