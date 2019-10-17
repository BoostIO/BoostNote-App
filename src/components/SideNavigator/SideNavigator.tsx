import React, { useMemo, useCallback } from 'react'
import { useRouteParams } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import Toolbar from '../atoms/Toolbar'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import { mdiSettings, mdiPlusCircle, mdiDotsHorizontal } from '@mdi/js'
import StorageNavigatorItem from './StorageNavigatorItem'
import Icon from '../atoms/Icon'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'

const StyledSideNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;

  .storageList {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    overflow: auto;
  }
  .empty {
    padding: 4px;
    user-select: none;
  }

  .bottomControl {
    height: 30px;
    display: flex;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    button {
      height: 30px;
      border: none;
      background-color: transparent;
      display: flex;
      align-items: center;
    }
    .addFolderButton {
      flex: 1;
      border-right: 1px solid ${({ theme }) => theme.colors.border};
    }
    .addFolderButtonIcon {
      margin-right: 4px;
    }
    .moreButton {
      width: 30px;
      display: flex;
      justify-content: center;
    }
  }
`

export default () => {
  const {
    createStorage,
    renameStorage,
    removeStorage,
    createFolder,
    removeFolder,
    storageMap
  } = useDb()
  const routeParams = useRouteParams()
  const { popup } = useContextMenu()
  const { prompt } = useDialog()

  const storageEntries = useMemo(() => {
    return entries(storageMap)
  }, [storageMap])

  const currentPathnameWithoutNoteId = useMemo(() => {
    switch (routeParams.name) {
      case 'storages.notes':
        return `/app/storages/${routeParams.storageId}/notes${routeParams.folderPathname}`
    }
    return '/app'
  }, [routeParams])

  const currentStorage = useMemo(() => {
    switch (routeParams.name) {
      case 'storages.notes':
        return storageMap[routeParams.storageId]
    }
    return null
  }, [routeParams, storageMap])

  const addFolder = useCallback(() => {
    if (currentStorage == null) {
      return
    }

    const defaultValue =
      routeParams.name === 'storages.notes' ? routeParams.folderPathname : '/'

    prompt({
      title: 'Create a Folder',
      message: 'Enter the path where do you want to create a folder',
      iconType: DialogIconTypes.Question,
      defaultValue,
      submitButtonLabel: 'Create Folder',
      onClose: (value: string | null) => {
        if (value == null) return
        createFolder(currentStorage.id, value)
      }
    })
  }, [prompt, createFolder, routeParams, currentStorage])

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'New Storage',
          onClick: async () => {
            prompt({
              title: 'Create a Storage',
              message: 'Enter name of a storage to create',
              iconType: DialogIconTypes.Question,
              submitButtonLabel: 'Create Storage',
              onClose: async (value: string | null) => {
                if (value == null) return
                await createStorage(value)
              }
            })
          }
        }
      ])
    },
    [popup, prompt, createStorage]
  )

  return (
    <StyledSideNavContainer>
      <Toolbar>
        <ToolbarSeparator />
        <ToolbarIconButton path={mdiSettings} onClick={() => {}} />
      </Toolbar>
      <ul className='storageList'>
        {storageEntries.map(([id, storage]) => {
          return (
            <StorageNavigatorItem
              key={id}
              currentPathname={currentPathnameWithoutNoteId}
              storage={storage}
              renameStorage={renameStorage}
              removeStorage={removeStorage}
              createFolder={createFolder}
              removeFolder={removeFolder}
            />
          )
        })}
        {storageEntries.length === 0 && (
          <div className='empty'>No storages</div>
        )}
      </ul>
      <div className='bottomControl'>
        <button
          className='addFolderButton'
          disabled={currentStorage == null}
          onClick={addFolder}
        >
          <Icon className='addFolderButtonIcon' path={mdiPlusCircle} /> Add
          Folder
        </button>
        <button
          className='moreButton'
          onClick={openSideNavContextMenu}
          onContextMenu={openSideNavContextMenu}
        >
          <Icon path={mdiDotsHorizontal} />
        </button>
      </div>
    </StyledSideNavContainer>
  )
}
