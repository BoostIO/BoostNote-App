import React, { useCallback, useEffect, useMemo } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { usePreferences } from '../../lib/preferences'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import Spacer from '../atoms/Spacer'
import BookmarkNavigatorFragment from '../molecules/BookmarkNavigatorFragment'
import { NoteStorage } from '../../lib/db/types'
import {
  openContextMenu,
  addIpcListener,
  removeIpcListener,
} from '../../lib/electronOnly'
import { values, getFolderNameFromPathname } from '../../lib/db/utils'
import { MenuItemConstructorOptions } from 'electron'
import { useStorageRouter } from '../../lib/storageRouter'
import { useRouteParams } from '../../lib/routeParams'
import {
  mdiChevronDown,
  mdiPlus,
  mdiFolder,
  mdiPound,
  mdiMagnify,
} from '@mdi/js'
import Icon from '../atoms/Icon'
import { flexCenter, textOverflow } from '../../lib/styled/styleFunctions'
import { dispatchNoteDetailFocusTitleInputEvent } from '../../lib/events'
import { osName } from '../../lib/platform'
import { useSearchModal } from '../../lib/searchModal'

interface NoteStorageNavigatorProps {
  storage: NoteStorage
}

const NoteStorageNavigator = ({ storage }: NoteStorageNavigatorProps) => {
  const { createStorage, storageMap, createNote } = useDb()
  const { prompt } = useDialog()
  const { push, hash } = useRouter()
  const { navigate } = useStorageRouter()
  const {
    togglePreferencesModal,
    setPreferences,
    preferences,
  } = usePreferences()
  const routeParams = useRouteParams()
  const storageId = storage.id

  const generalShowAppNavigator = preferences['general.showAppNavigator']

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
              return storage.id !== storageId
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
            type: 'separator',
          },
          {
            type: 'normal',
            label: 'Toggle App Navigator',
            click: () => {
              setPreferences((prevPreferences) => {
                return {
                  ...prevPreferences,
                  'general.showAppNavigator': !prevPreferences[
                    'general.showAppNavigator'
                  ],
                }
              })
            },
          },
        ],
      })
    },
    [
      storageId,
      setPreferences,
      navigate,
      openCreateStorageDialog,
      togglePreferencesModal,
      storageMap,
    ]
  )

  const extraNewNoteLabel = useMemo<React.ReactNode | null>(() => {
    switch (routeParams.name) {
      case 'storages.notes':
        if (routeParams.folderPathname !== '/') {
          return (
            <>
              in <Icon className='icon' path={mdiFolder} />{' '}
              {getFolderNameFromPathname(routeParams.folderPathname)}
            </>
          )
        }
        break
      case 'storages.tags.show':
        return (
          <>
            with <Icon className='icon' path={mdiPound} />
            {routeParams.tagName}
          </>
        )
    }
    return null
  }, [routeParams])

  const createNoteByRoute = useCallback(async () => {
    let folderPathname = '/'
    let tags: string[] = []
    let baseHrefAfterCreate = `/app/storages/${storageId}/notes`
    switch (routeParams.name) {
      case 'storages.tags.show':
        tags = [routeParams.tagName]
        baseHrefAfterCreate = `/app/storages/${storageId}/tags/${routeParams.tagName}`
        break
      case 'storages.notes':
        if (routeParams.folderPathname !== '/') {
          folderPathname = routeParams.folderPathname
          baseHrefAfterCreate = `/app/storages/${storageId}/notes${folderPathname}`
        }
        break
    }

    const note = await createNote(storageId, {
      folderPathname,
      tags,
    })
    if (note == null) {
      return
    }

    push(`${baseHrefAfterCreate}/${note._id}#new`)
  }, [storageId, routeParams, push, createNote])

  useEffect(() => {
    if (hash === '#new') {
      push({ hash: '' })
      setImmediate(() => {
        dispatchNoteDetailFocusTitleInputEvent()
      })
    }
  }, [push, hash])

  const { toggleShowSearchModal } = useSearchModal()

  useEffect(() => {
    const handler = () => {
      toggleShowSearchModal()
    }
    addIpcListener('search', handler)
    return () => {
      removeIpcListener('search', handler)
    }
  }, [toggleShowSearchModal])

  useEffect(() => {
    const handler = () => {
      createNoteByRoute()
    }
    addIpcListener('new-note', handler)
    return () => {
      removeIpcListener('new-note', handler)
    }
  }, [createNoteByRoute])

  useEffect(() => {
    const handler = () => {
      createNoteByRoute()
    }
    addIpcListener('new-folder', handler)
    return () => {
      removeIpcListener('new-folder', handler)
    }
  }, [createNoteByRoute])

  return (
    <NavigatorContainer onContextMenu={openStorageContextMenu}>
      {!generalShowAppNavigator && <WindowControlSpacer />}
      <TopButton onClick={openStorageContextMenu}>
        <div className='topButtonLabel'>{storage.name}</div>
        <Icon path={mdiChevronDown} />
      </TopButton>

      <SearchButton onClick={toggleShowSearchModal}>
        <div className='icon'>
          <Icon path={mdiMagnify} />
        </div>
        <div className='label'>Search</div>
        <div className='kbd'>{osName === 'macos' ? '⌘P' : 'Ctrl P'}</div>
      </SearchButton>
      <NewNoteButton onClick={createNoteByRoute}>
        <div className='icon'>
          <Icon path={mdiPlus} />
        </div>
        <div className='label'>New Note</div>
        {extraNewNoteLabel != null && (
          <div className='extra'>{extraNewNoteLabel}</div>
        )}
      </NewNoteButton>

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
  height: 40px;
  -webkit-app-region: drag;
`

const TopButton = styled.button`
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  -webkit-app-region: drag;
  text-align: left;
  padding: 0 16px;
  border: none;
  color: ${({ theme }) => theme.navItemColor};
  background-color: transparent;
  background-color: ${({ theme }) => theme.navItemBackgroundColor};
  & > .topButtonLabel {
    font-size: 18px;
    font-weight: 600;
    padding-right: 10px;
    ${textOverflow}
  }
  &:hover {
    color: ${({ theme }) => theme.navItemActiveColor};
  }
`

const SearchButton = styled.button`
  margin: 0 8px;
  height: 34px;
  color: ${({ theme }) => theme.secondaryButtonLabelColor};
  background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  align-items: center;
  display: flex;
  padding: 0 8px 0 4px;
  font-size: 14px;
  &:hover {
    background-color: ${({ theme }) =>
      theme.secondaryButtonHoverBackgroundColor};
    & > .kbd {
      display: flex;
    }
  }
  & > .icon {
    width: 24px;
    height: 24px;
    ${flexCenter};
    flex-shrink: 0;
  }
  & > .label {
    white-space: nowrap;
    flex: 1;
  }

  & > .kbd {
    display: none;
    font-size: 12px;
    margin-left: 5px;
    ${textOverflow};
    align-items: center;
    flex-shrink: 0;
  }
`

const NewNoteButton = styled.button`
  margin: 8px 8px;
  height: 34px;
  color: ${({ theme }) => theme.primaryButtonLabelColor};
  background-color: ${({ theme }) => theme.primaryButtonBackgroundColor};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  align-items: center;
  display: flex;
  padding: 0 8px 0 4px;
  font-size: 14px;
  &:hover {
    background-color: ${({ theme }) => theme.primaryButtonHoverBackgroundColor};
    .extra {
      display: flex;
    }
  }

  & > .icon {
    width: 24px;
    height: 24px;
    ${flexCenter};
    flex-shrink: 0;
  }
  & > .label {
    white-space: nowrap;
    flex-shrink: 0;
  }
  & > .extra {
    display: none;
    font-size: 12px;
    margin-left: 5px;
    ${textOverflow};
    align-items: center;
    & > .icon {
      flex-shrink: 0;
      margin: 0 4px;
    }
  }
`
