import React, { useCallback } from 'react'
import styled from '../../../lib/styled'
import { SettingsTab, useSettings } from '../../../lib/stores/settings'
import cc from 'classcat'

interface TabButtonProps {
  label: string
  active: boolean
  tab: SettingsTab
  id?: string
}

const TabButton = ({ label, tab, active, id }: TabButtonProps) => {
  const { openSettingsTab } = useSettings()
  const onClickHandler = useCallback(() => {
    openSettingsTab(tab)
  }, [openSettingsTab, tab])

  return (
    <StyledButton
      onClick={onClickHandler}
      className={cc([active && 'active'])}
      id={id}
    >
      <span className='label'>{label}</span>
    </StyledButton>
  )
}

export default TabButton

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.medium}px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  color: ${({ theme }) => theme.baseTextColor};
  cursor: pointer;

  .icon {
    margin-left: ${({ theme }) => theme.space.small}px;
    margin-right: ${({ theme }) => theme.space.xsmall}px;

    svg {
      vertical-align: sub;
    }
  }

  .label {
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-align: left;
  }

  &.active,
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.emphasizedTextColor};
  }

  &.active {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
  }
`
