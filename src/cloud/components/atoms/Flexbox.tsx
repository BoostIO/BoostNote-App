import React, { PropsWithChildren } from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'

interface FlexboxProps {
  flex?: string
  shrink?: number
  grow?: number
  basis?: string
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | 'inherit' | 'initial'
  justifyContent?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'inherit'
    | 'initial'
  alignItems?:
    | 'center'
    | 'start'
    | 'end'
    | 'flex-start'
    | 'flex-end'
    | 'baseline'
    | 'inherit'
    | 'initial'
  direction?:
    | 'column'
    | 'column-reverse'
    | 'row'
    | 'row-reverse'
    | 'unset'
    | 'inherit'
    | 'initial'
  style?: React.CSSProperties
  className?: string
  onClick?: any
}

const Flexbox = ({
  children,
  justifyContent = 'flex-start',
  alignItems = 'center',
  direction = 'row',
  flex,
  grow = 1,
  shrink = 1,
  basis = 'auto',
  wrap = 'nowrap',
  style,
  className,
  onClick,
}: PropsWithChildren<FlexboxProps>) => (
  <StyledFlexbox
    onClick={onClick}
    style={
      flex != null
        ? {
            flex,
            ...style,
          }
        : {
            flexBasis: basis,
            flexShrink: shrink,
            flexGrow: grow,
            ...style,
          }
    }
    className={cc([
      className,
      `justify-${justifyContent}`,
      `align-${alignItems}`,
      `direction-${direction}`,
      `wrap-${wrap}`,
    ])}
  >
    {children}
  </StyledFlexbox>
)

const StyledFlexbox = styled.div`
  min-width: 0;
  display: flex;

  &.direction-unset {
    flex-direction: unset;
  }
  &.direction-initial {
    flex-direction: initial;
  }
  &.direction-inherit {
    flex-direction: inherit;
  }
  &.direction-row-reverse {
    flex-direction: row-reverse;
  }
  &.direction-column-reverse {
    flex-direction: column-reverse;
  }
  &.direction-column {
    flex-direction: column;
  }
  &.direction-row {
    flex-direction: row;
  }
  &.align-center {
    align-items: center;
  }
  &.align-start {
    align-items: start;
  }
  &.align-end {
    align-items: end;
  }
  &.align-flex-start {
    align-items: flex-start;
  }
  &.align-flex-end {
    align-items: flex-end;
  }
  &.align-baseline {
    align-items: baseline;
  }
  &.align-inherit {
    align-items: inherit;
  }
  &.align-initial {
    align-items: initial;
  }
  &.justify-flex-start {
    justify-content: flex-start;
  }
  &.justify-flex-end {
    justify-content: flex-end;
  }
  &.justify-center {
    justify-content: center;
  }
  &.justify-space-between {
    justify-content: space-between;
  }
  &.justify-space-around {
    justify-content: space-around;
  }
  &.justify-initial {
    justify-content: initial;
  }
  &.justify-inherit {
    justify-content: inherit;
  }
  &.wrap-nowrap {
    flex-wrap: nowrap;
  }
  &.wrap-wrap {
    flex-wrap: wrap;
  }
  &.wrap-wrap-reverse {
    flex-wrap: wrap-reverse;
  }
  &.wrap-initial {
    flex-wrap: initial;
  }
  &.wrap-inherit {
    flex-wrap: inherit;
  }

  &.button {
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.subtleTextColor};
    }
  }
`

export default Flexbox
