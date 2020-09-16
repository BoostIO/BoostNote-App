import React, { useMemo, useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
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

const Empty = styled.button`
  width: 100%;
  border: none;
  text-decoration: underline;
  padding: 0.25em;
  text-align: center;
  background-color: transparent;
  cursor: pointer;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  .active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

const ScrollableContainer = styled.div`
  flex: 1;
  padding: 0 0 10px;
  overflow: auto;
`

interface StorageNavigatorProps {
  storage: NoteStorage
}

const StorageNavigator = ({ storage }: StorageNavigatorProps) => {
  const { createStorage, storageMap } = useDb()
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
  const { toggleClosed } = usePreferences()

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

      <ScrollableContainer>
        <BookmarkNavigatorFragment storage={storage} />
        <StorageNavigatorFragment storage={storage} />
        <Spacer onContextMenu={openSideNavContextMenu} />
      </ScrollableContainer>
    </NavigatorContainer>
  )
}

export default StorageNavigator
