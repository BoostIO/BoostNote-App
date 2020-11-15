import React, { useMemo, useCallback, MouseEventHandler } from 'react'
import styled from '../../lib/styled'
import {
  borderRight,
  border,
  secondaryButtonStyle,
} from '../../lib/styled/styleFunctions'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import Icon from '../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { useRouter } from '../../lib/router'
import { useActiveStorageId, useRouteParams } from '../../lib/routeParams'
import AppNavigatorStorageItem from '../molecules/AppNavigatorStorageItem'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu } from '../../lib/electronOnly'
import { osName } from '../../lib/platform'
import { useGeneralStatus } from '../../lib/generalStatus'
import AppNavigatorBoostHubTeamItem from '../molecules/AppNavigatorBoostHubTeamItem'
import { logOut } from '../../lib/boosthub'

const TopLevelNavigator = () => {
  const { storageMap } = useDb()
  const { push } = useRouter()
  const { setPreferences, preferences } = usePreferences()
  const { generalStatus } = useGeneralStatus()
  const routeParams = useRouteParams()

  const boostHubUserInfo = preferences['boosthub.user']

  const activeStorageId = useActiveStorageId()

  const storages = useMemo(() => {
    return entries(storageMap).map(([storageId, storage]) => {
      const active = activeStorageId === storageId
      return (
        <AppNavigatorStorageItem
          key={storageId}
          active={active}
          storage={storage}
        />
      )
    })
  }, [storageMap, activeStorageId])

  const activeBoostHubTeamDomain = useMemo<string | null>(() => {
    if (routeParams.name !== 'boosthub.teams.show') {
      return null
    }
    return routeParams.domain
  }, [routeParams])

  const boostHubTeams = useMemo(() => {
    return generalStatus.boostHubTeams.map((boostHubTeam) => {
      return (
        <AppNavigatorBoostHubTeamItem
          key={`boost-hub-team-${boostHubTeam.domain}`}
          active={activeBoostHubTeamDomain === boostHubTeam.domain}
          name={boostHubTeam.name}
          domain={boostHubTeam.domain}
        />
      )
    })
  }, [generalStatus.boostHubTeams, activeBoostHubTeamDomain])

  const goToStorageCreatePage = useCallback(() => {
    push(`/app/storages`)
  }, [push])

  const { createStorage } = useDb()
  const { prompt } = useDialog()
  const { setGeneralStatus } = useGeneralStatus()

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: 'New Storage',
            click: async () => {
              prompt({
                title: 'Create a Storage',
                message: 'Enter name of a storage to create',
                iconType: DialogIconTypes.Question,
                submitButtonLabel: 'Create Storage',
                onClose: async (value: string | null) => {
                  if (value == null) return
                  const storage = await createStorage(value)
                  push(`/app/storages/${storage.id}/notes`)
                },
              })
            },
          },
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Log Out',
            click: async () => {
              await logOut()
              if (routeParams.name === 'boosthub.teams.show') {
                push('/app/boosthub/login')
              }
              setPreferences({
                'boosthub.user': null,
              })
              setGeneralStatus({
                boostHubTeams: [],
              })
            },
          },
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Hide App Navigator',
            click: () => {
              setPreferences({
                'general.showAppNavigator': false,
              })
            },
          },
        ],
      })
    },
    [
      prompt,
      createStorage,
      push,
      setPreferences,
      setGeneralStatus,
      routeParams.name,
    ]
  )

  const openNewStorageContextMenu: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          { label: 'Create a new storage', click: goToStorageCreatePage },
          boostHubUserInfo == null
            ? {
                label: 'Create a team account',
                click: () => {
                  push('/app/boosthub/login')
                },
              }
            : {
                label: 'Create a team',
                click: () => {
                  push('/app/boosthub/teams')
                },
              },
        ],
      })
    },
    [goToStorageCreatePage, push, boostHubUserInfo]
  )

  return (
    <Container>
      {osName === 'macos' && <Spacer />}
      <ListContainer onContextMenu={openSideNavContextMenu}>
        {storages}
        {boostHubTeams}
      </ListContainer>
      <ControlContainer>
        <NavigatorButton onClick={openNewStorageContextMenu}>
          <Icon path={mdiPlus} />
        </NavigatorButton>
      </ControlContainer>
    </Container>
  )
}

export default TopLevelNavigator

const Spacer = styled.div`
  height: 12px;
  flex-shrink: 0;
`

const Container = styled.div`
  width: 68px;
  height: 100%;
  ${borderRight}
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  overflow-y: auto;
`

const ListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  margin-top: 8px;
`

const ControlContainer = styled.div`
  display: flex;
  justify-content: center;
`

const NavigatorButton = styled.button`
  ${secondaryButtonStyle}
  height: 50px;
  width: 50px;
  ${border}
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  border-radius: 5px;
  &:first-child {
    margin-top: 5px;
  }
`
