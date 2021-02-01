import React from 'react'
import styled from '../../../../lib/styled'
import IconMdi from '../../../atoms/IconMdi'
import { baseIconStyle } from '../../../../lib/styled/styleFunctions'

interface SideNavigatorIconButtonProps {
  path: string
  onClick: (e: any) => void
  className?: string
}

const SideNavigatorIconButton = ({
  path,
  onClick,
}: SideNavigatorIconButtonProps) => (
  <StyledIconButton tabIndex={-1} onClick={onClick}>
    <IconMdi path={path} size={19} />
  </StyledIconButton>
)

export default SideNavigatorIconButton

const StyledIconButton = styled.button`
  background: none;
  ${baseIconStyle}
  font-size: ${({ theme }) => theme.fontSizes.default}px;
  padding: 0 3px !important;
  cursor: pointer;

  svg {
    display: inline-block;
    position: relative;
    vertical-align: sub !important;
    margin: 0;
  }
`
