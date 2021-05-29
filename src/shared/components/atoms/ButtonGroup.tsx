import React from 'react'
import { AppComponent } from '../../lib/types'
import cc from 'classcat'
import styled from '../../lib/styled'

interface ButtonGroupProps {
  display?: 'inline-flex' | 'flex'
  layout?: 'collapsed' | 'spread'
  justifyContent?: 'flex-start' | 'flex-end'
}

const ButtonGroup: AppComponent<ButtonGroupProps> = ({
  children,
  display = 'inline-flex',
  layout = 'collapsed',
  justifyContent = 'flex-start',
}) => {
  return (
    <StyledButtonGroup
      className={cc(['button__group', `button__group--${layout}`])}
      display={display}
      justifyContent={justifyContent}
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

  &.button__group--spread {
    align-items: center;

    button + button {
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
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
