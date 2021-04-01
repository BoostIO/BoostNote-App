import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'

interface TabButtonProps {
  label: string
  tab: string
  active: boolean
  setTab: (tab: string) => void
}

const StyledButton = styled.button`
  width: 100%;
  border-radius: 4px;
  height: 30px;
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  .label {
    flex: 1;
    color: ${({ theme }) => theme.navItemColor};
    text-align: left;
    padding-left: 15px;
    font-size: 14px;
  }
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  &.active {
    color: ${({ theme }) => theme.textColor};
    background-color: ${({ theme }) => theme.navItemActiveBackgroundColor};

    .label {
      color: ${({ theme }) => theme.textColor};
      color: ${({ theme }) => theme.navItemActiveColor};
    }
  }
`

const TabButton = ({ label, tab, setTab, active }: TabButtonProps) => {
  const selectTab = useCallback(() => {
    setTab(tab)
  }, [tab, setTab])
  return (
    <StyledButton onClick={selectTab} className={cc([active && 'active'])}>
      <div className='label'>{label}</div>
    </StyledButton>
  )
}

export default TabButton
