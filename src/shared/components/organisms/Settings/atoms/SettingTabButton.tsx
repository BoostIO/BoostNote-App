import React, { MouseEventHandler } from 'react'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import { SettingsTab } from '../../../../../cloud/lib/stores/settings'

interface SettingTabButtonProps {
  label: string
  active: boolean
  tab: SettingsTab
  id?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

const SettingTabButton = ({
  label,
  tab,
  active,
  id,
  onClick,
}: SettingTabButtonProps) => {
  return (
    <Container
      className={cc([active && 'active'])}
      tab={tab}
      id={id}
      onClick={onClick}
    >
      {label}
    </Container>
  )
}

const Container = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.md}px;
  background-color: transparent;
  border: none;
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  text-align: left;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`

export default SettingTabButton
