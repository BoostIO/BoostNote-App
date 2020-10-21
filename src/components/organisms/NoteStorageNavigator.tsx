import React, { useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { usePreferences } from '../../lib/preferences'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import Spacer from '../atoms/Spacer'
import BookmarkNavigatorFragment from '../molecules/BookmarkNavigatorFragment'
import { NoteStorage } from '../../lib/db/types'
import { openContextMenu } from '../../lib/electronOnly'
import { values } from '../../lib/db/utils'
import { MenuItemConstructorOptions } from 'electron'
import { useStorageRouter } from '../../lib/storageRouter'
import { useActiveStorageId } from '../../lib/routeParams'
import { mdiChevronDown } from '@mdi/js'
import Icon from '../atoms/Icon'

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
          {
            type: 'normal',
            label: 'Preferences',
            click: () => {
              togglePreferencesModal()
            },
          },
          { type: 'separator' },
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
    [
      activeStorageId,
      setPreferences,
      navigate,
      togglePreferencesModal,
      storageMap,
    ]
  )

  return (
    <NavigatorContainer>
      <TopButton onClick={openStorageContextMenu}>
        <StorageName>{storage.name}</StorageName>
        <Icon path={mdiChevronDown} />
      </TopButton>

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

const NavigatorContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.navBackgroundColor};
`

const ScrollableContainer = styled.div`
  flex: 1;
  padding: 0 0 10px;
  overflow: auto;
`

const TopButton = styled.button`
  display: flex;
  flex-direction: row;
  background-color: transparent;
  text-align: left;
  padding: 0 8px;
  height: 40px;
  border: none;
  color: ${({ theme }) => theme.navLabelColor};
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
`

const StorageName = styled.div`
  font-size: 18px;
  font-weight: 600;
  padding-right: 10px;
`
