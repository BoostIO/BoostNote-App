import React, { useCallback } from 'react'
import { border, flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiAccountGroup } from '@mdi/js'
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
  background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
  color: ${({ theme }) => theme.secondaryButtonLabelColor};
  border: 1px solid ${({ theme }) => theme.borderColor};
  font-size: 13px;

  &:hover,
  &:active,
  &.active {
    cursor: pointer;
    color: ${({ theme }) => theme.secondaryButtonHoverLabelColor};
    background-color: ${({ theme }) => theme.primaryColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const IconContainer = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  font-size: 14px;
  background-color: ${({ theme }) => theme.navBackgroundColor};
  ${border}
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -5px;
  right: -5px;
  z-index: 1;
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

  const openStorageContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return (
    <Container
      title={name}
      className={active ? 'active' : ''}
      onClick={navigateToTeam}
      onContextMenu={openStorageContextMenu}
    >
      <MainButton className={active ? 'active' : ''} onClick={navigateToTeam}>
        {name.slice(0, 1)}
      </MainButton>
      {
        <IconContainer>
          <Icon path={mdiAccountGroup} />
        </IconContainer>
      }
    </Container>
  )
}

export default AppNavigatorBoostHubTeamItem
