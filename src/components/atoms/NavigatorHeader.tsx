import React from 'react'
import styled from '../../lib/styled'

const HeaderContainer = styled.header`
  position: relative;
  user-select: none;
  height: 24px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  align-items: center;
`

const Label = styled.div`
  padding: 0 0 0 0.5em;
  color: ${({ theme }) => theme.sideNavLabelColor};
`

const Control = styled.div`
  display: flex;
`

interface NavigatorHeaderProps {
  label: string
  control?: React.ReactNode
  onContextMenu: React.MouseEventHandler<HTMLDivElement>
}

const NavigatorHeader = ({
  label,
  onContextMenu,
  control,
}: NavigatorHeaderProps) => {
  return (
    <HeaderContainer onContextMenu={onContextMenu}>
      <Label>{label}</Label>
      {control && <Control>{control}</Control>}
    </HeaderContainer>
  )
}

export default NavigatorHeader
