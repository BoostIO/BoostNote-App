import React, { useCallback } from 'react'
import { border, flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { useRouter } from '../../lib/router'

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
  &.active {
    border-color: ${({ theme }) => theme.textColor};
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
}

const AppNavigatorBoostHubTeamItem = ({
  active,
  domain,
  name,
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
      <MainButton className={active ? 'active' : ''} onClick={navigateToTeam}>
        {name.slice(0, 1)}
      </MainButton>
    </Container>
  )
}

export default AppNavigatorBoostHubTeamItem
