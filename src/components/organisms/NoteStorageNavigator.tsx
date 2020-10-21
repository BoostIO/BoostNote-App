import React, { useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { usePreferences } from '../../lib/preferences'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import { mdiHammerWrench } from '@mdi/js'
import NavigatorButton from '../atoms/NavigatorButton'
import Spacer from '../atoms/Spacer'
import BookmarkNavigatorFragment from '../molecules/BookmarkNavigatorFragment'
import { NoteStorage } from '../../lib/db/types'
import { openContextMenu } from '../../lib/electronOnly'
import { values } from '../../lib/db/utils'
import { MenuItemConstructorOptions } from 'electron'
import { useStorageRouter } from '../../lib/storageRouter'
import { useActiveStorageId } from '../../lib/routeParams'

const NavigatorContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.navBackgroundColor};
`

const TopControl = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  -webkit-app-region: drag;
`

const ScrollableContainer = styled.div`
  flex: 1;
  padding: 0 0 10px;
  overflow: auto;
`

interface NoteStorageNavigatorProps {
  storage: NoteStorage
}

const NoteStorageNavigator = ({ storage }: NoteStorageNavigatorProps) => {
  const { createStorage, storageMap } = useDb()
  const { prompt } = useDialog()
  const { push } = useRouter()
  const { navigate } = useStorageRouter()
  const activeStorageId = useActiveStorageId()

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
        ],
      })
    },
    [prompt, createStorage, push]
  )
  const { togglePreferencesModal, setPreferences } = usePreferences()

  const openStorageContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()

      const storages = values(storageMap)
      openContextMenu({
        menuItems: [
          ...storages
            .filter((storage) => {
              return storage.id !== activeStorageId
            })
            .map<MenuItemConstructorOptions>((storage) => {
              return {
                type: 'normal',
                label: `Switch to ${storage.name} storage`,
                click: () => {
                  navigate(storage.id)
                },
              }
            }),
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Toggle Top Level Navigator',
            click: () => {
              setPreferences((prevPreferences) => {
                return {
                  ...prevPreferences,
                  'general.showTopLevelNavigator': !prevPreferences[
                    'general.showTopLevelNavigator'
                  ],
                }
              })
            },
          },
        ],
      })
    },
    [activeStorageId, setPreferences, navigate, storageMap]
  )

  return (
    <NavigatorContainer>
      <TopControl onContextMenu={openSideNavContextMenu}>
        <Spacer />
        <NavigatorButton
          iconPath={mdiHammerWrench}
          title='Preferences'
          onClick={togglePreferencesModal}
        />
      </TopControl>

      <button onClick={openStorageContextMenu}>{storage.name}</button>

      <button>New Doc</button>

      <ScrollableContainer>
        <BookmarkNavigatorFragment storage={storage} />
        <StorageNavigatorFragment storage={storage} />
        <Spacer onContextMenu={openSideNavContextMenu} />
      </ScrollableContainer>
    </NavigatorContainer>
  )
}

export default NoteStorageNavigator
