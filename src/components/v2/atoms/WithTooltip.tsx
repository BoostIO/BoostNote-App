import React, { useState } from 'react'
import styled from '../../../lib/v2/styled'
import cc from 'classcat'

interface WithTooltipProps {
  className?: string
  side?: 'top' | 'left' | 'right' | 'bottom' | 'bottom-right'
  tooltip?: React.ReactNode
  tagName?: 'span' | 'div' | 'p' | 'li'
}

const WithTooltip: React.FC<WithTooltipProps> = ({
  children,
  tooltip,
  className,
  tagName = 'div',
  side = 'bottom',
}) => {
  const [open, setOpen] = useState(false)

  const Tag = tagName

  if (tooltip == null) {
    return <>{children}</>
  }

  return (
    <Tag
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(false)}
      style={{ position: 'relative', display: 'flex' }}
      className={className}
    >
      {children}
      {open && (
        <Container className={cc(['tooltip__container', side])}>
          <div className='tooltip__base'>
            <span>{tooltip}</span>
          </div>
        </Container>
      )}
    </Tag>
  )
}

export default WithTooltip

const Container = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  margin-top: 9px;
  width: max-content;
  min-width: 40px;
  text-align: center;
  pointer-events: none;

  &.top {
    top: initial;
    bottom: 120%;

    &::after {
      border-bottom: 0;
      border-top: 9px solid ${({ theme }) => theme.colors.text.second};
      bottom: -9px;
      top: initial;
    }
  }

  &.right {
    left: 100%;
    top: 50%;
    transform: translateY(-100%);
  }

  &.bottom-right {
    left: 100%;
    transform: translateX(-20%);
  }

  > div {
    background-color: ${({ theme }) => theme.colors.background.main};

    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    border-radius: 5px;
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    color: ${({ theme }) => theme.colors.text.main};

    .tooltip-text {
      background-color: none;
      padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
    }

    .tooltip-command {
      display: inline-block;
      line-height: 18px;
      padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
      border-radius: 2px;
      border: 1px solid ${({ theme }) => theme.colors.border.second};
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }
`
