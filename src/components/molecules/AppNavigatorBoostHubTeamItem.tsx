import React, { useCallback } from 'react'
import { border, flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { useRouter } from '../../lib/router'
import Icon from '../atoms/Icon'
import { mdiAccountMultiple } from '@mdi/js'

const Container = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  margin-bottom: 4px;
  &:first-child {
    margin-top: 10px;
  }
  ${flexCenter}
  border-radius: 14px;
  border-width: 3px;
  border-style: solid;
  border-color: transparent;
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.borderColor};
  }
  &.active {
    border-color: ${({ theme }) => theme.textColor};
  }

  & > .teamIcon {
    height: 20px;
    width: 20px;
    border-radius: 10px;
    background-color: ${({ theme }) => theme.navBackgroundColor};
    ${border}
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: -5px;
    right: -5px;
    z-index: 1;
  }
`

const MainButton = styled.button`
  height: 36px;
  width: 36px;
  border-radius: 8px;
  ${border}
  cursor: pointer;
  ${flexCenter}
  font-size: 18px;
  border: none;
  background-color: ${({ theme }) => theme.teamSwitcherBackgroundColor};
  border: 1px solid ${({ theme }) => theme.teamSwitcherBorderColor};
  color: ${({ theme }) => theme.teamSwitcherTextColor};
  font-size: 13px;
  & > .icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  &:hover,
  &:active,
  &.active {
    cursor: pointer;
    background-color: ${({ theme }) => theme.teamSwitcherHoverBackgroundColor};
    color: ${({ theme }) => theme.teamSwitcherHoverTextColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

interface AppNavigatorBoostHubTeamItemProps {
  domain: string
  name: string
  active: boolean
  iconUrl?: string
}

const AppNavigatorBoostHubTeamItem = ({
  active,
  domain,
  name,
  iconUrl,
}: AppNavigatorBoostHubTeamItemProps) => {
  const { push } = useRouter()

  const navigateToTeam = useCallback(() => {
    push(`/app/boosthub/teams/${domain}`)
  }, [push, domain])

  return (
    <Container
      title={name}
      className={active ? 'active' : ''}
      onClick={navigateToTeam}
    >
      <MainButton className={active ? 'active' : ''}>
        {iconUrl == null ? (
          name.slice(0, 1)
        ) : (
          <img className='icon' src={iconUrl} />
        )}
      </MainButton>

      <div className='teamIcon'>
        <Icon path={mdiAccountMultiple} />
      </div>
    </Container>
  )
}

export default AppNavigatorBoostHubTeamItem
