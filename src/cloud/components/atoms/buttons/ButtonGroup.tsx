import React from 'react'
import styled from '../../../lib/styled'

interface ButtonGroupProps {
  children: React.ReactNode
}

const ButtonGroup = ({ children }: ButtonGroupProps) => {
  return <StyledButtonGroup>{children}</StyledButtonGroup>
}

const StyledButtonGroup = styled.div`
  display: inline-flex;
  position: relative;

  & > button:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  & > button:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  & > button:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
`

export default ButtonGroup
