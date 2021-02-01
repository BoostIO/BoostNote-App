import React from 'react'
import { mdiArrowUpBold } from '@mdi/js'
import cc from 'classcat'
import IconMdi from '../IconMdi'
import styled from '../../../lib/styled'
import {
  primaryButtonStyle,
  baseButtonStyle,
} from '../../../lib/styled/styleFunctions'

interface ScrollUpButtonProps {
  active: boolean
}

const ScrollUpButton = ({ active }: ScrollUpButtonProps) => {
  return (
    <StyledScrollUpButton
      className={cc(['scrollUpButton', active && 'active'])}
      onClick={() => {
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
      }}
    >
      <IconMdi path={mdiArrowUpBold} />
    </StyledScrollUpButton>
  )
}

const StyledScrollUpButton = styled.button`
  ${baseButtonStyle}
  ${primaryButtonStyle}
  height: 45px;
  width: 45px;
  border-radius: 6px;
  position: fixed;
  right: ${({ theme }) => theme.space.xlarge * -2}px;
  bottom: ${({ theme }) => theme.space.default}px;
  -webkit-transition: all 0.3s ease-out;
  -moz-transition: all 0.3s ease-out;
  -o-transition: all 0.3s ease-out;
  transition: all 0.3s ease-out;

  &.active {
    right: ${({ theme }) => theme.space.default}px;
  }
`

export default ScrollUpButton
