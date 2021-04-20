import React, { useCallback, useRef, useState } from 'react'
import styled from '../../../lib/v2/styled'
import cc from 'classcat'

interface WithTooltipProps {
  className?: string
  side?: 'right' | 'bottom'
  tooltip?: React.ReactNode
}

const posOffset = 5
const WithTooltip: React.FC<WithTooltipProps> = ({
  children,
  tooltip,
  className,
  side = 'bottom',
}) => {
  const [open, setOpen] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>()
  const ref = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const onMouseOver = useCallback(() => {
    if (ref.current == null || tooltipRef.current == null) {
      setTooltipStyle(undefined)
      return
    }

    const rectOffset = ref.current.getBoundingClientRect()
    const tooltipOffset = tooltipRef.current.getBoundingClientRect()

    let style: React.CSSProperties = {}
    switch (side) {
      case 'right':
        style = {
          left: rectOffset.left + rectOffset.width + posOffset,
          top: rectOffset.top - (tooltipOffset.height - rectOffset.height) / 2,
        }
        break
      case 'bottom':
        style = {
          left: rectOffset.left - (tooltipOffset.width - rectOffset.width) / 2,
          top: rectOffset.top + rectOffset.height + posOffset,
        }
        break
      default:
        return
    }
    setTooltipStyle(style)
  }, [side, ref])

  if (tooltip == null) {
    return <>{children}</>
  }

  return (
    <div
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onPointerOver={onMouseOver}
      onClick={() => setOpen(false)}
      className={className}
      ref={ref}
    >
      {children}
      {open && (
        <Container
          className={cc(['tooltip__container', side])}
          style={tooltipStyle}
          ref={tooltipRef}
        >
          <div className='tooltip__base'>
            <span>{tooltip}</span>
          </div>
        </Container>
      )}
    </div>
  )
}

export default WithTooltip

const Container = styled.div`
  position: fixed;
  z-index: 100;
  width: max-content;
  min-width: 40px;
  text-align: center;
  pointer-events: none;

  > div {
    background-color: ${({ theme }) => theme.colors.background.primary};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    border-radius: 5px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.primary};

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
