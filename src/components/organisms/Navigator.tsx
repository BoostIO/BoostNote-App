import React, { useMemo, useCallback } from 'react'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { usePreferences } from '../../lib/preferences'
import StorageNavigatorFragment from '../molecules/StorageNavigatorFragment'
import { mdiPlus, mdiHammerWrench } from '@mdi/js'
import NavigatorButton from '../atoms/NavigatorButton'
import Spacer from '../atoms/Spacer'
import { usePathnameWithoutNoteId } from '../../lib/router'

const NavigatorContainer = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.navBackgroundColor};
`

const TopControl = styled.div`
  display: flex;
  margin: 1em 0;
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
  overflow: auto;
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
  const pathname = usePathnameWithoutNoteId()
  const { toggleClosed } = usePreferences()

  return (
    <NavigatorContainer>
      <TopControl onContextMenu={openSideNavContextMenu}>
        <Spacer />
        <NavigatorButton
          iconPath={mdiPlus}
          title='New Storage'
          active={pathname === '/app/storages'}
          onClick={() => push('/app/storages')}
        />
        <NavigatorButton
          iconPath={mdiHammerWrench}
          title='Preferences'
          onClick={toggleClosed}
        />
      </TopControl>

      <ScrollableContainer>
        {storageEntries.map(([, storage]) => (
          <StorageNavigatorFragment key={storage.id} storage={storage} />
        ))}
        {storageEntries.length === 0 && (
          <Empty onClick={() => push('/app/storages')}>
            There are no storages.
            <br />
            Click here to create one.
          </Empty>
        )}
        <Spacer onContextMenu={openSideNavContextMenu} />
      </ScrollableContainer>
    </NavigatorContainer>
  )
}

export default Navigator
