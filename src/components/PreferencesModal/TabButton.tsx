import React, { useCallback } from 'react'
import styled from '../../lib/styled'

interface TabButtonProps {
  label: string
  tab: string
  active: boolean
  setTab: (tab: string) => void
}

const StyledButton = styled.button`
  display: block;
  width: 100%;
  height: 30px;
  &.active {
    background-color: ${({ theme }) => theme.colors.active};
  }
`

const TabButton = ({ label, tab, setTab, active }: TabButtonProps) => {
  const selectTab = useCallback(() => {
    setTab(tab)
  }, [tab, setTab])
  return (
    <StyledButton onClick={selectTab} className={active ? 'active' : ''}>
      {label}
    </StyledButton>
  )
}

export default TabButton
