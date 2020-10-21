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
import { mdiChevronDown, mdiPlus } from '@mdi/js'
import Icon from '../atoms/Icon'

interface NoteStorageNavigatorProps {
  storage: NoteStorage
}

const NoteStorageNavigator = ({ storage }: NoteStorageNavigatorProps) => {
  const { createStorage, storageMap } = useDb()
  const { prompt } = useDialog()
  const { push } = useRouter()
  const { navigate } = useStorageRouter()
  const {
    togglePreferencesModal,
    setPreferences,
    preferences,
  } = usePreferences()
  const activeStorageId = useActiveStorageId()

  const generalShowTopLevelNavigator =
    preferences['general.showTopLevelNavigator']

  const openCreateStorageDialog = useCallback(() => {
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
  }, [prompt, createStorage, push])

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          {
            type: 'normal',
            label: 'New Storage',
            click: async () => {
              openCreateStorageDialog()
            },
          },
        ],
      })
    },
    [openCreateStorageDialog]
  )

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
            type: 'normal',
            label: 'New Storage',
            click: () => {
              openCreateStorageDialog()
            },
          },
          {
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Preferences',
            click: () => {
              togglePreferencesModal()
            },
          },
          {
            type: 'normal',
            label: 'Toggle App Navigator',
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
      openCreateStorageDialog,
      togglePreferencesModal,
      storageMap,
    ]
  )

  return (
    <NavigatorContainer>
      {!generalShowTopLevelNavigator && <WindowControlSpacer />}
      <TopButton onClick={openStorageContextMenu}>
        <StorageName>{storage.name}</StorageName>
        <Icon path={mdiChevronDown} />
      </TopButton>

      <NewDocButton>
        <Icon path={mdiPlus} />
        New Doc
      </NewDocButton>

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
const WindowControlSpacer = styled.div`
  height: 20px;
  -webkit-app-region: drag;
`

const TopButton = styled.button`
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  -webkit-app-region: drag;
  text-align: left;
  padding: 0 16px;
  border: none;
  color: ${({ theme }) => theme.navLabelColor};
  background-color: transparent;
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  &:hover {
    color: ${({ theme }) => theme.textColor};
  }
`

const StorageName = styled.div`
  font-size: 18px;
  font-weight: 600;
  padding-right: 10px;
`

const NewDocButton = styled.button`
  margin: 8px 8px;
  height: 34px;
  padding: 0;
  color: ${({ theme }) => theme.primaryButtonLabelColor};
  background-color: ${({ theme }) => theme.primaryButtonBackgroundColor};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  align-items: center;
  display: flex;
  padding: 0 8px;
  &:hover {
    background-color: ${({ theme }) => theme.primaryButtonHoverBackgroundColor};
  }
`
