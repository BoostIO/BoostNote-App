import React, { useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import { mdiHammerWrench } from '@mdi/js'
import NavigatorButton from '../atoms/NavigatorButton'
import Spacer from '../atoms/Spacer'
import BookmarkNavigatorFragment from '../molecules/BookmarkNavigatorFragment'
import { NoteStorage } from '../../lib/db/types'

const NavigatorContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.navBackgroundColor};
`

const TopControl = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  -webkit-app-region: drag;
`

const ScrollableContainer = styled.div`
  flex: 1;
  padding: 0 0 10px;
  overflow: auto;
`

interface NoteStorageNavigatorProps {
  storage: NoteStorage
}

const NoteStorageNavigator = ({ storage }: NoteStorageNavigatorProps) => {
  const { createStorage } = useDb()
  const { popup } = useContextMenu()
  const { prompt } = useDialog()
  const { push } = useRouter()

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
  const { toggleClosed, setPreferences } = usePreferences()

  const openContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'Show App Navigator',
          onClick: () => {
            setPreferences({
              'general.showTopLevelNavigator': true,
            })
          },
        },
      ])
    },
    [popup, setPreferences]
  )

  return (
    <NavigatorContainer>
      <TopControl onContextMenu={openSideNavContextMenu}>
        <Spacer />
        <NavigatorButton
          iconPath={mdiHammerWrench}
          title='Preferences'
          onClick={toggleClosed}
        />
      </TopControl>

      <button onClick={openContextMenu}>{storage.name}</button>

      <button>New Doc</button>

      <ScrollableContainer>
        <BookmarkNavigatorFragment storage={storage} />
        <StorageNavigatorFragment storage={storage} />
        <Spacer onContextMenu={openSideNavContextMenu} />
      </ScrollableContainer>
    </NavigatorContainer>
  )
}

export default NoteStorageNavigator
