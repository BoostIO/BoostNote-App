import React, { useMemo, useCallback } from 'react'
import { useRouteParams, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import { mdiTuneVertical, mdiPlusCircle, mdiDotsHorizontal } from '@mdi/js'
import StorageNavigatorItem from './StorageNavigatorItem'
import Icon from '../atoms/Icon'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import { backgroundColor, iconColor } from '../../lib/styled/styleFunctions'
import TutorialsNavigator from '../Tutorials/TutorialsNavigator'

const StyledSideNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${backgroundColor}
  .topControl {
    height: 50px;
    display: flex;
    .spacer {
      flex: 1;
    }
    .button {
      width: 50px;
      height: 50px;
      background-color: transparent;
      border: none;
      ${iconColor}
      font-size: 24px;
    }
  }

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

  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()

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

  const { toggleClosed, preferences } = usePreferences()

  return (
    <StyledSideNavContainer>
      <div className='topControl'>
        <div className='spacer' />
        <button className='button' onClick={toggleClosed}>
          <Icon path={mdiTuneVertical} />
        </button>
      </div>
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
        {preferences['general.displayTutorials'] && <TutorialsNavigator />}
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
