import React, { useMemo, useCallback } from 'react'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import {
  mdiTuneVertical,
  mdiPlusCircleOutline,
  mdiDeleteOutline,
  mdiDelete,
  mdiImage,
  mdiImageOutline,
  mdiSync
} from '@mdi/js'
import Icon from '../atoms/Icon'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import {
  sideBarBackgroundColor,
  sideBarTextColor,
  sideBarSecondaryTextColor,
  uiTextColor
} from '../../lib/styled/styleFunctions'
import SideNavigatorItem from './SideNavigatorItem'
import { useGeneralStatus } from '../../lib/generalStatus'
import ControlButton from './ControlButton'
import FolderListFragment from './FolderListFragment'
import TagListFragment from './TagListFragment'
import TutorialsNavigator from '../Tutorials/TutorialsNavigator'
import { useUsers } from '../../lib/accounts'
import MdiIcon from '@mdi/react'

const Description = styled.nav`
  margin-left: 5px;
  margin-bottom: 10px;
  font-size: 18px;
  ${sideBarTextColor}
`

const StyledSideNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${sideBarBackgroundColor}
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
      ${sideBarSecondaryTextColor}
      font-size: 24px;
    }
  }

  .storageList {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  .empty {
    padding: 4px;
    padding-left: 26px;
    margin-bottom: 4px;
    ${uiTextColor}
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

const CreateStorageButton = styled.button`
  position: absolute;
  right: 0px;
  border: none;
  background-color: transparent;
  cursor: pointer;
`

const Spacer = styled.div`
  flex: 1;
`

export default () => {
  const {
    createStorage,
    createFolder,
    renameFolder,
    renameStorage,
    removeStorage,
    storageMap,
    syncStorage
  } = useDb()
  const { popup } = useContextMenu()
  const { prompt, messageBox } = useDialog()
  const { push } = useRouter()
  const [[user]] = useUsers()

  const storageEntries = useMemo(() => {
    return entries(storageMap)
  }, [storageMap])

  const openSideNavContextMenu = useCallback(
    (event: React.MouseEvent) => {
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
  const {
    toggleSideNavOpenedItem,
    sideNavOpenedItemSet,
    openSideNavFolderItemRecursively
  } = useGeneralStatus()

  const currentPathname = usePathnameWithoutNoteId()

  return (
    <StyledSideNavContainer>
      <div className='topControl'>
        <div className='spacer' />
        <button className='button' onClick={toggleClosed}>
          <Icon path={mdiTuneVertical} />
        </button>
      </div>

      <Description>
        Storages
        <CreateStorageButton onClick={() => push('/app/storages')}>
          <MdiIcon path={mdiPlusCircleOutline} size='2em' color='gray' />
        </CreateStorageButton>
      </Description>

      <div className='storageList'>
        {storageEntries.map(([, storage]) => {
          const itemId = `storage:${storage.id}`
          const storageIsFolded = !sideNavOpenedItemSet.has(itemId)
          const showPromptToCreateFolder = (folderPathname: string) => {
            prompt({
              title: 'Create a Folder',
              message: 'Enter the path where do you want to create a folder',
              iconType: DialogIconTypes.Question,
              defaultValue: folderPathname === '/' ? '/' : `${folderPathname}/`,
              submitButtonLabel: 'Create Folder',
              onClose: async (value: string | null) => {
                if (value == null) {
                  return
                }
                if (value.endsWith('/')) {
                  value = value.slice(0, value.length - 1)
                }
                await createFolder(storage.id, value)

                push(`/app/storages/${storage.id}/notes${value}`)

                // Open folder item
                openSideNavFolderItemRecursively(storage.id, value)
              }
            })
          }
          const showPromptToRenameFolder = (folderPathname: string) => {
            prompt({
              title: 'Rename the Folder',
              message:
                'Enter the new folder name, every note and subfolder paths will also be updated.',
              iconType: DialogIconTypes.Question,
              defaultValue: folderPathname.split('/').pop(),
              submitButtonLabel: 'Rename Folder',
              onClose: async (value: string | null) => {
                if (value == null || value.includes('/') || value === '') {
                  return
                }
                const folderPathSplit = folderPathname.split('/')
                folderPathSplit.pop()
                const newPathname = folderPathSplit.join('/') + '/' + value
                await renameFolder(storage.id, folderPathname, newPathname)

                // push(`/app/storages/${storage.id}/notes${newPathname}`)
              }
            })
          }

          const trashcanPagePathname = `/app/storages/${storage.id}/trashcan`
          const trashcanPageIsActive = currentPathname === trashcanPagePathname

          const attachmentsPagePathname = `/app/storages/${storage.id}/attachments`
          const attachmentsPageIsActive =
            currentPathname === attachmentsPagePathname

          const controlComponents = [
            <ControlButton
              key='addFolderButton'
              onClick={() => showPromptToCreateFolder('/')}
              iconPath={mdiPlusCircleOutline}
            />
          ]

          if (storage.cloudStorage != null && user != null) {
            const cloudSync = () => {
              if (user == null) {
                // TODO: toast login needed
                console.error('login required')
              }
              syncStorage(storage.id, user).catch(e => {
                // TODO: toast sync failed error
                console.error(e)
              })
            }

            controlComponents.unshift(
              <ControlButton
                key='syncButton'
                onClick={cloudSync}
                iconPath={mdiSync}
              />
            )
          }

          return (
            <React.Fragment key={itemId}>
              <SideNavigatorItem
                depth={0}
                label={storage.name}
                folded={storageIsFolded}
                onClick={() => push(`/app/storages/${storage.id}`)}
                onFoldButtonClick={() => {
                  toggleSideNavOpenedItem(itemId)
                }}
                onContextMenu={event => {
                  event.preventDefault()
                  popup(event, [
                    {
                      type: MenuTypes.Normal,
                      label: 'Rename Storage',
                      onClick: async () => {
                        prompt({
                          title: `Rename "${storage.name}" storage`,
                          message: 'Enter new storage name',
                          iconType: DialogIconTypes.Question,
                          defaultValue: storage.name,
                          submitButtonLabel: 'Rename Storage',
                          onClose: async (value: string | null) => {
                            if (value == null) return
                            await renameStorage(storage.id, value)
                          }
                        })
                      }
                    },
                    {
                      type: MenuTypes.Normal,
                      label: 'Remove Storage',
                      onClick: async () => {
                        messageBox({
                          title: `Remove "${storage.name}" storage`,
                          message:
                            'The storage will be unlinked from this app.',
                          iconType: DialogIconTypes.Warning,
                          buttons: ['Remove Storage', 'Cancel'],
                          defaultButtonIndex: 0,
                          cancelButtonIndex: 1,
                          onClose: (value: number | null) => {
                            if (value === 0) {
                              removeStorage(storage.id)
                            }
                          }
                        })
                      }
                    }
                  ])
                }}
                controlComponents={controlComponents}
              />
              {!storageIsFolded && (
                <>
                  <FolderListFragment
                    storage={storage}
                    showPromptToCreateFolder={showPromptToCreateFolder}
                    showPromptToRenameFolder={showPromptToRenameFolder}
                  />
                  <TagListFragment storage={storage} />
                  <SideNavigatorItem
                    depth={1}
                    label='Attachments'
                    iconPath={
                      attachmentsPageIsActive ? mdiImage : mdiImageOutline
                    }
                    active={attachmentsPageIsActive}
                    onClick={() => push(attachmentsPagePathname)}
                    onContextMenu={event => {
                      event.preventDefault()
                    }}
                  />
                  <SideNavigatorItem
                    depth={1}
                    label='Trash Can'
                    iconPath={
                      trashcanPageIsActive ? mdiDelete : mdiDeleteOutline
                    }
                    active={trashcanPageIsActive}
                    onClick={() => push(trashcanPagePathname)}
                    onContextMenu={event => {
                      event.preventDefault()
                      // TODO: Implement context menu(restore all notes)
                    }}
                  />
                </>
              )}
            </React.Fragment>
          )
        })}
        {storageEntries.length === 0 && (
          <div className='empty'>No storages</div>
        )}
        {preferences['general.tutorials'] === 'display' && (
          <TutorialsNavigator />
        )}
        <Spacer onContextMenu={openSideNavContextMenu} />
      </div>
    </StyledSideNavContainer>
  )
}
