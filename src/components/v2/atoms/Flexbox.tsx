import React from 'react'
import cc from 'classcat'
import { AppComponent } from '../../../lib/v2/types'
import styled from '../../../lib/v2/styled'

interface FlexboxProps {
  flex?: string
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
  className?: string
}

const Flexbox: AppComponent<FlexboxProps> = ({
  children,
  justifyContent = 'flex-start',
  alignItems = 'center',
  direction = 'row',
  flex,
  wrap = 'nowrap',
  className,
}) => (
  <Container
    flex={flex}
    className={cc([
      className,
      'flexbox',
      `flexbox__justify--${justifyContent}`,
      `flexbox__align--${alignItems}`,
      `flexbox__direction--${direction}`,
      `flexbox__wrap--${wrap}`,
    ])}
  >
    {children}
  </Container>
)

const Container = styled.div`
  min-width: 0;
  display: flex;

  &.flexbox__direction--unset {
    flex-direction: unset;
  }
  &.flexbox__direction--initial {
    flex-direction: initial;
  }
  &.flexbox__direction--inherit {
    flex-direction: inherit;
  }
  &.flexbox__direction--row-reverse {
    flex-direction: row-reverse;
  }
  &.flexbox__direction--column-reverse {
    flex-direction: column-reverse;
  }
  &.flexbox__direction--column {
    flex-direction: column;
  }
  &.flexbox__direction--row {
    flex-direction: row;
  }
  &.flexbox__align--center {
    align-items: center;
  }
  &.flexbox__align--start {
    align-items: start;
  }
  &.flexbox__align--end {
    align-items: end;
  }
  &.flexbox__align--flex-start {
    align-items: flex-start;
  }
  &.flexbox__align--flex-end {
    align-items: flex-end;
  }
  &.flexbox__align--baseline {
    align-items: baseline;
  }
  &.flexbox__align--inherit {
    align-items: inherit;
  }
  &.flexbox__align--initial {
    align-items: initial;
  }
  &.flexbox__justify--flex-start {
    justify-content: flex-start;
  }
  &.flexbox__justify--flex-end {
    justify-content: flex-end;
  }
  &.flexbox__justify--center {
    justify-content: center;
  }
  &.flexbox__justify--space-between {
    justify-content: space-between;
  }
  &.flexbox__justify--space-around {
    justify-content: space-around;
  }
  &.flexbox__justify--initial {
    justify-content: initial;
  }
  &.flexbox__justify--inherit {
    justify-content: inherit;
  }
  &.flexbox__wrap--nowrap {
    flex-wrap: nowrap;
  }
  &.flexbox__wrap--wrap {
    flex-wrap: wrap;
  }
  &.flexbox__wrap--wrap-reverse {
    flex-wrap: wrap-reverse;
  }
  &.flexbox__wrap--initial {
    flex-wrap: initial;
  }
  &.flexbox__wrap--inherit {
    flex-wrap: inherit;
  }
`

export default Flexbox
