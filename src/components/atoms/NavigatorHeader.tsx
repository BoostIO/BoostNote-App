import React from 'react'
import styled from '../../lib/styled'
import { textOverflow, borderBottom } from '../../lib/styled/styleFunctions'
import Icon from './Icon'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'

const HeaderContainer = styled.header`
  position: relative;
  user-select: none;
  height: 24px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  align-items: center;
  background-color: ${({ theme }) => theme.inputBackground};
  ${borderBottom}
`

const Label = styled.div`
  color: ${({ theme }) => theme.navLabelColor};
  flex: 1;
  ${textOverflow}
`

const Control = styled.div`
  display: flex;
`

const ClickableContainer = styled.div`
  display: flex;
  flex: 1;
  cursor: pointer;
`

interface NavigatorHeaderProps {
  label: string
  control?: React.ReactNode
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>
  folded?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const NavigatorHeader = ({
  folded,
  label,
  onContextMenu,
  onClick,
  control,
}: NavigatorHeaderProps) => {
  return (
    <HeaderContainer onContextMenu={onContextMenu}>
      <ClickableContainer onClick={onClick}>
        {folded != null && (
          <Icon path={folded ? mdiChevronRight : mdiChevronDown} size={18} />
        )}
        <Label>{label}</Label>
      </ClickableContainer>
      {control && <Control>{control}</Control>}
    </HeaderContainer>
  )
}

export default NavigatorHeader
