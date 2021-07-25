import React from 'react'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'
import styled from '../../lib/styled'

interface ButtonGroupProps {
  display?: 'inline-flex' | 'flex'
  layout?: 'collapsed' | 'spread' | 'column'
  justifyContent?: 'flex-start' | 'flex-end'
  flex?: string
}

const ButtonGroup: AppComponent<ButtonGroupProps> = ({
  children,
  className,
  display = 'inline-flex',
  layout = 'collapsed',
  justifyContent = 'flex-start',
  flex,
}) => {
  return (
    <StyledButtonGroup
      className={cc(['button__group', `button__group--${layout}`, className])}
      display={display}
      justifyContent={justifyContent}
      flex={flex}
    >
      {children}
    </StyledButtonGroup>
  )
}

const StyledButtonGroup = styled.div<{
  display: string
  justifyContent: string
}>`
  display: ${({ display }) => display};
  justify-content: ${({ justifyContent }) => justifyContent};
  position: relative;
  ${({ flex }) => (flex != null ? `flex: ${flex};` : '')};

  &.button__group--spread {
    align-items: center;

    button + button {
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }

  &.button__group--column {
    flex-direction: column;
    justify-content: center;
    align-items: center;

    button + button {
      margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
      margin-left: 0;
    }
  }

  &.button__group--collapsed {
    > button:nth-child(2n + 1) {
      margin: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    > button:nth-child(2n) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      margin: 0;
    }

    > button:not(:first-child):not(:last-child) {
      border-radius: 0;
    }
  }
`

export default ButtonGroup
