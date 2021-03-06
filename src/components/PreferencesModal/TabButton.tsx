import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import cc from 'classcat'
import Icon from '../atoms/Icon'
import { mdiAlertCircleOutline } from '@mdi/js'

interface TabButtonProps {
  label: string
  tab: string
  active: boolean
  setTab: (tab: string) => void
  alert?: boolean
}

const StyledButton = styled.button`
  width: 100%;
  height: 40px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 0 0 1em;
  .border {
    width: 4px;
    height: 24px;
  }
  .label {
    margin-left: 18px;
    flex: 1;
    color: ${({ theme }) => theme.uiTextColor};
    text-align: left;
    font-size: 14px;
  }
  &.active {
    color: ${({ theme }) => theme.textColor};

    .border {
      background-color: ${({ theme }) => theme.primaryColor};
    }

    .label {
      color: ${({ theme }) => theme.textColor};
    }
  }
`

const TabButton = ({ label, tab, setTab, active, alert }: TabButtonProps) => {
  const selectTab = useCallback(() => {
    setTab(tab)
  }, [tab, setTab])
  return (
    <StyledButton onClick={selectTab} className={cc([active && 'active'])}>
      <div className='border' />
      <div className='label'>{label}</div>
      {alert && (
        <Icon
          color='red'
          path={mdiAlertCircleOutline}
          style={{ marginRight: 5 }}
        />
      )}
    </StyledButton>
  )
}

export default TabButton
