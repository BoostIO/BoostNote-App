import React, { useMemo, useCallback } from 'react'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import NavigatorItem from '../atoms/NavigatorItem'
import { useTranslation } from 'react-i18next'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import { mdiStarOutline, mdiTuneVertical } from '@mdi/js'
import NavigatorButton from '../atoms/NavigatorButton'
import Spacer from '../atoms/Spacer'

const NavigatorContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.sideNavBackgroundColor};
`

const TopControl = styled.div`
  display: flex;
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

  const { toggleClosed } = usePreferences()

  const currentPathname = usePathnameWithoutNoteId()

  const { t } = useTranslation()

  return (
    <NavigatorContainer>
      <TopControl>
        <Spacer />
        <NavigatorButton onClick={toggleClosed} iconPath={mdiTuneVertical} />
      </TopControl>
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
      <Spacer onContextMenu={openSideNavContextMenu} />
    </NavigatorContainer>
  )
}

export default Navigator
