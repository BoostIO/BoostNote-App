import React, { useMemo, useCallback } from 'react'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../../lib/db/utils'
import styled from '../../../lib/styled'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../../lib/contextMenu'
import { usePreferences } from '../../../lib/preferences'
import NavigatorItem from './NavigatorItem'
import { useGeneralStatus } from '../../lib/generalStatus'
import ControlButton from './ControlButton'
import FolderListFragment from './FolderListFragment'
import TagListFragment from './TagListFragment'
import { useUsers } from '../../../lib/accounts'
import { useToast } from '../../../lib/toast'
import { useTranslation } from 'react-i18next'
import Icon from '../../../components/atoms/Icon'
import {
  mdiClose,
  mdiTrashCan,
  mdiBookOpen,
  mdiSync,
  mdiPlus,
  mdiTuneVertical,
} from '@mdi/js'

const StyledSideNavContainer = styled.nav`
  display: flex;
  background-color: ${({ theme }) => theme.sideNavBackgroundColor};
  flex-direction: column;
  height: 100%;
  .topControl {
    height: 50px;
    display: flex;
    -webkit-app-region: drag;
    .spacer {
      flex: 1;
    }
    .button {
      width: 50px;
      height: 50px;
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-size: 24px;

      transition: color 200ms ease-in-out;
      color: ${({ theme }) => theme.sideNavButtonColor};
      &:hover {
        color: ${({ theme }) => theme.sideNavButtonHoverColor};
      }

      &:active,
      .active {
        color: ${({ theme }) => theme.sideNavButtonActiveColor};
      }
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
    color: ${({ theme }) => theme.sideNavLabelColor};
    user-select: none;
  }

  .bottomControl {
    height: 35px;
    display: flex;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    button {
      height: 35px;
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

const Spacer = styled.div`
  flex: 1;
`

interface NavigatorProps {
  toggle: () => void
}

export default ({ toggle }: NavigatorProps) => {
  const {
    createStorage,
    createFolder,
    renameFolder,
    renameStorage,
    removeStorage,
    storageMap,
    syncStorage,
  } = useDb()
  const { popup } = useContextMenu()
  const { prompt, messageBox } = useDialog()
  const { push } = useRouter()
  const [[user]] = useUsers()
  const { pushMessage } = useToast()

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
                const storage = await createStorage(value)
                push(`/m/storages/${storage.id}/notes`)
              },
            })
          },
        },
      ])
    },
    [popup, prompt, createStorage, push]
  )

  const { toggleClosed } = usePreferences()
  const {
    toggleSideNavOpenedItem,
    sideNavOpenedItemSet,
    openSideNavFolderItemRecursively,
    toggleNav,
  } = useGeneralStatus()

  const currentPathname = usePathnameWithoutNoteId()

  const { t } = useTranslation()

  return (
    <StyledSideNavContainer>
      <div className='topControl'>
        <button className='button' onClick={toggle}>
          <Icon path={mdiClose} />
        </button>
        <div className='spacer' />
        <button
          className='button'
          onClick={() => {
            push('/m/storages')
            toggleNav()
          }}
        >
          <Icon path={mdiPlus} />
        </button>
        <button className='button' onClick={toggleClosed}>
          <Icon path={mdiTuneVertical} />
        </button>
      </div>

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

                push(`/m/storages/${storage.id}/notes${value}`)

                // Open folder item
                openSideNavFolderItemRecursively(storage.id, value)
              },
            })
          }
          const showPromptToRenameFolder = (folderPathname: string) => {
            prompt({
              title: t('folder.rename'),
              message: t('folder.renameMessage'),
              iconType: DialogIconTypes.Question,
              defaultValue: folderPathname.split('/').pop(),
              submitButtonLabel: t('folder.rename'),
              onClose: async (value: string | null) => {
                const folderPathSplit = folderPathname.split('/')
                if (
                  value == null ||
                  value === '' ||
                  value === folderPathSplit.pop()
                ) {
                  return
                }
                const newPathname = folderPathSplit.join('/') + '/' + value
                try {
                  await renameFolder(storage.id, folderPathname, newPathname)
                  push(`/m/storages/${storage.id}/notes${newPathname}`)
                  openSideNavFolderItemRecursively(storage.id, newPathname)
                } catch (error) {
                  pushMessage({
                    title: t('general.error'),
                    description: t('folder.renameErrorMessage'),
                  })
                }
              },
            })
          }

          const allNotesPagePathname = `/m/storages/${storage.id}/notes`
          const allNotesPageIsActive = currentPathname === allNotesPagePathname

          const trashcanPagePathname = `/m/storages/${storage.id}/trashcan`
          const trashcanPageIsActive = currentPathname === trashcanPagePathname

          const controlComponents = [
            <ControlButton
              key={`${storage.id}-addFolderButton`}
              onClick={() => showPromptToCreateFolder('/')}
              iconPath={mdiPlus}
            />,
          ]

          if (storage.cloudStorage != null && user != null) {
            const cloudSync = () => {
              if (user == null) {
                pushMessage({
                  title: 'No User Error',
                  description: 'Please login first to sync the storage.',
                })
              }
              syncStorage(storage.id)
            }

            controlComponents.unshift(
              <ControlButton
                key={`${storage.id}-syncButton`}
                onClick={cloudSync}
                iconPath={mdiSync}
                spin={storage.sync != null}
              />
            )
          }

          return (
            <React.Fragment key={itemId}>
              <NavigatorItem
                depth={0}
                label={storage.name}
                folded={storageIsFolded}
                onFoldButtonClick={() => {
                  toggleSideNavOpenedItem(itemId)
                }}
                onClick={() => {
                  toggleSideNavOpenedItem(itemId)
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  popup(event, [
                    {
                      type: MenuTypes.Normal,
                      label: t('storage.rename'),
                      onClick: async () => {
                        prompt({
                          title: `Rename "${storage.name}" storage`,
                          message: t('storage.renameMessage'),
                          iconType: DialogIconTypes.Question,
                          defaultValue: storage.name,
                          submitButtonLabel: t('storage.rename'),
                          onClose: async (value: string | null) => {
                            if (value == null) return
                            await renameStorage(storage.id, value)
                          },
                        })
                      },
                    },
                    {
                      type: MenuTypes.Normal,
                      label: t('storage.remove'),
                      onClick: async () => {
                        messageBox({
                          title: `Remove "${storage.name}" storage`,
                          message: t('storage.removeMessage'),
                          iconType: DialogIconTypes.Warning,
                          buttons: [t('storage.remove'), t('general.cancel')],
                          defaultButtonIndex: 0,
                          cancelButtonIndex: 1,
                          onClose: (value: number | null) => {
                            if (value === 0) {
                              removeStorage(storage.id)
                            }
                          },
                        })
                      },
                    },
                  ])
                }}
                controlComponents={controlComponents}
              />
              {!storageIsFolded && (
                <>
                  <NavigatorItem
                    depth={1}
                    label='All Notes'
                    iconPath={mdiBookOpen}
                    active={allNotesPageIsActive}
                    onClick={() => {
                      push(allNotesPagePathname)
                      toggleNav()
                    }}
                  />
                  <FolderListFragment
                    storage={storage}
                    showPromptToCreateFolder={showPromptToCreateFolder}
                    showPromptToRenameFolder={showPromptToRenameFolder}
                  />
                  <TagListFragment storage={storage} />

                  <NavigatorItem
                    depth={1}
                    label={t('general.trash')}
                    iconPath={mdiTrashCan}
                    active={trashcanPageIsActive}
                    onClick={() => {
                      push(trashcanPagePathname)
                      toggleNav()
                    }}
                    onContextMenu={(event) => {
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
          <div className='empty'>{t('storage.noStorage')}</div>
        )}

        <Spacer onContextMenu={openSideNavContextMenu} />
      </div>
    </StyledSideNavContainer>
  )
}
