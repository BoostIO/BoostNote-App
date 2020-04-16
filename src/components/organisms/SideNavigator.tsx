import React, { useMemo, useCallback } from 'react'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import {
  sideBarBackgroundColor,
  sideBarSecondaryTextColor,
  iconColor,
  sideBarTextColor,
} from '../../lib/styled/styleFunctions'
import SideNavigatorItem from '../molecules/SideNavigatorItem'
import TutorialsNavigator from '../Tutorials/TutorialsNavigator'
import { useTranslation } from 'react-i18next'
import { IconAddRound, IconAdjustVertical } from '../icons'
import StorageSideNavigatorItem from '../molecules/StorageSideNavigatorItem'
import { mdiStarOutline } from '@mdi/js'

const SideNavigatorLabel = styled.nav`
  font-size: 14px;
  ${sideBarSecondaryTextColor}
  user-select: none;
  margin: 0.5em 1em;
`

const StyledSideNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${sideBarBackgroundColor}
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
      ${iconColor}
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
    ${sideBarTextColor}
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

const CreateStorageButton = styled.button`
  position: absolute;
  right: 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  ${iconColor}
`

const Spacer = styled.div`
  flex: 1;
`

export default () => {
  const { createStorage, storageMap } = useDb()
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
                const storage = await createStorage(value)
                push(`/app/storages/${storage.id}/notes`)
              },
            })
          },
        },
      ])
    },
    [popup, prompt, createStorage, push]
  )

  const { toggleClosed, preferences } = usePreferences()

  const currentPathname = usePathnameWithoutNoteId()

  const { t } = useTranslation()

  return (
    <StyledSideNavContainer>
      <div className='topControl'>
        <div className='spacer' />
        <button className='button' onClick={toggleClosed}>
          <IconAdjustVertical size='0.8em' />
        </button>
      </div>

      <SideNavigatorItem
        iconPath={mdiStarOutline}
        depth={0}
        label='Bookmarks'
        active={currentPathname === `/app/bookmarks`}
        onClick={() => push(`/app/bookmarks`)}
      />

      <SideNavigatorLabel>
        Storages
        <CreateStorageButton onClick={() => push('/app/storages')}>
          <IconAddRound size='1.7em' />
        </CreateStorageButton>
      </SideNavigatorLabel>

      <div className='storageList'>
        {storageEntries.map(([, storage]) => (
          <StorageSideNavigatorItem key={storage.id} storage={storage} />
        ))}
        {storageEntries.length === 0 && (
          <div className='empty'>{t('storage.noStorage')}</div>
        )}
        {preferences['general.tutorials'] === 'display' && (
          <TutorialsNavigator />
        )}
        <Spacer onContextMenu={openSideNavContextMenu} />
      </div>
    </StyledSideNavContainer>
  )
}
