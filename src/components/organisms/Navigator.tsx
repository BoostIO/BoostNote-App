import React, { useMemo, useCallback } from 'react'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import NavigatorItem from '../atoms/NavigatorItem'
import TutorialsNavigator from '../Tutorials/TutorialsNavigator'
import { useTranslation } from 'react-i18next'
import { IconAdjustVertical } from '../icons'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import { mdiStarOutline } from '@mdi/js'

const NavigatorContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.sideNavBackgroundColor};
`

const Spacer = styled.div`
  flex: 1;
`

const Navigator = () => {
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
    <NavigatorContainer>
      <div className='topControl'>
        <div className='spacer' />
        <button className='button' onClick={toggleClosed}>
          <IconAdjustVertical size='0.8em' />
        </button>
      </div>
      <NavigatorItem
        iconPath={mdiStarOutline}
        depth={0}
        label='Bookmarks'
        active={currentPathname === `/app/bookmarks`}
        onClick={() => push(`/app/bookmarks`)}
      />
      {/* <SideNavigatorLabel>
        Storages
        <CreateStorageButton onClick={() => push('/app/storages')}>
          <IconAddRound size='1.7em' />
        </CreateStorageButton>
      </SideNavigatorLabel> */}
      <div className='storageList'>
        {storageEntries.map(([, storage]) => (
          <StorageNavigatorFragment key={storage.id} storage={storage} />
        ))}
        {storageEntries.length === 0 && (
          <div className='empty'>{t('storage.noStorage')}</div>
        )}
      </div>
      {preferences['general.tutorials'] === 'display' && <TutorialsNavigator />}
      <Spacer onContextMenu={openSideNavContextMenu} />
    </NavigatorContainer>
  )
}

export default Navigator
