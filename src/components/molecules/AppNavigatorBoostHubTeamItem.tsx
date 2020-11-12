import React, { useCallback } from 'react'
import { secondaryButtonStyle, border } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiAccountGroup } from '@mdi/js'
import { useRouter } from '../../lib/router'

const Container = styled.div`
  position: relative;
  height: 50px;
  width: 50px;
  margin-bottom: 8px;
  &:first-child {
    margin-top: 5px;
  }
`

const MainButton = styled.button`
  height: 50px;
  width: 50px;
  border-radius: 5px;
  ${secondaryButtonStyle}
  ${border}
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
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
