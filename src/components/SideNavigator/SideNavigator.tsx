import React, { useMemo, useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import { mdiTuneVertical, mdiPlusCircleOutline } from '@mdi/js'
import Icon from '../atoms/Icon'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import { backgroundColor, iconColor } from '../../lib/styled/styleFunctions'
import SideNavigatorItem from './SideNavigatorItem'
import { useGeneralStatus } from '../../lib/generalStatus'
import ControlButton from './ControlButton'
import FolderListFragment from './FolderListFragment'
import TagListFragment from './TagListFragment'

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
    display: flex;
    flex-direction: column;
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

const Spacer = styled.div`
  flex: 1;
`

export default () => {
  const {
    createStorage,
    createFolder,
    // renameStorage,
    // removeStorage,
    // removeFolder,
    // updateNote,
    storageMap
  } = useDb()
  const { popup } = useContextMenu()
  const { prompt } = useDialog()
  const { push } = useRouter()

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

  const { toggleClosed } = usePreferences()
  const {
    toggleSideNavOpenedItem,
    sideNavOpenedItemSet,
    openSideNavFolderItemRecursively
  } = useGeneralStatus()

  return (
    <StyledSideNavContainer>
      <div className='topControl'>
        <div className='spacer' />
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

                push(`/app/storages/${storage.id}/notes${value}`)

                // Open folder item
                openSideNavFolderItemRecursively(storage.id, value)
              }
            })
          }
          return (
            <React.Fragment key={itemId}>
              <SideNavigatorItem
                folded={storageIsFolded}
                onClick={() => push(`/app/storages/${storage.id}`)}
                onFoldButtonClick={() => {
                  toggleSideNavOpenedItem(itemId)
                }}
                label={storage.name}
                depth={0}
                controlComponents={[
                  <ControlButton
                    key='addFolderButton'
                    onClick={() => showPromptToCreateFolder('/')}
                    iconPath={mdiPlusCircleOutline}
                  />
                ]}
              />
              {!storageIsFolded && (
                <>
                  <FolderListFragment
                    storage={storage}
                    showPromptToCreateFolder={showPromptToCreateFolder}
                  />
                  <TagListFragment storage={storage} />
                </>
              )}
            </React.Fragment>
          )
        })}
        {storageEntries.length === 0 && (
          <div className='empty'>No storages</div>
        )}
        <Spacer onContextMenu={openSideNavContextMenu} />
      </div>
      <SideNavigatorItem
        depth={0}
        iconPath={mdiPlusCircleOutline}
        label='Add Storage'
        onClick={() => push('/app/storages')}
      />
    </StyledSideNavContainer>
  )
}
