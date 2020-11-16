import React, { useCallback } from 'react'
import { NoteStorage } from '../../lib/db/types'
import {
  secondaryButtonStyle,
  border,
  flexCenter,
} from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import Icon from '../atoms/Icon'
import { mdiSync } from '@mdi/js'
import { useDb } from '../../lib/db'
import { useFirstUser } from '../../lib/preferences'
import { useToast } from '../../lib/toast'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useTranslation } from 'react-i18next'
import { MenuItemConstructorOptions } from 'electron'
import { openContextMenu } from '../../lib/electronOnly'
import { useStorageRouter } from '../../lib/storageRouter'

const Container = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  margin-bottom: 4px;
  &:first-child {
    margin-top: 10px;
  }
  ${flexCenter}
  border-radius: 14px;
  border-width: 3px;
  border-style: solid;
  border-color: transparent;
  &.active {
    border-color: ${({ theme }) => theme.textColor};
  }
`

const MainButton = styled.button`
  height: 36px;
  width: 36px;
  border-radius: 8px;
  ${border}
  cursor: pointer;
  ${flexCenter}
  font-size: 18px;
  border: none;
  background-color: ${({ theme }) => theme.secondaryButtonBackgroundColor};
  color: ${({ theme }) => theme.secondaryButtonLabelColor};
  border: 1px solid ${({ theme }) => theme.borderColor};
  font-size: 13px;

  &:hover,
  &:active,
  &.active {
    cursor: pointer;
    color: ${({ theme }) => theme.secondaryButtonHoverLabelColor};
    background-color: ${({ theme }) => theme.primaryColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const SyncButton = styled.button`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  ${secondaryButtonStyle}
  background-color: ${({ theme }) => theme.navBackgroundColor};
  ${border}
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -5px;
  right: -5px;
  z-index: 1;
`

interface AppNavigatorStorageItemProps {
  active: boolean
  storage: NoteStorage
}

const AppNavigatorStorageItem = ({
  active,
  storage,
}: AppNavigatorStorageItemProps) => {
  const { syncStorage, renameStorage, removeStorage } = useDb()
  const user = useFirstUser()
  const { pushMessage } = useToast()
  const { prompt, messageBox } = useDialog()
  const { t } = useTranslation()
  const { navigate } = useStorageRouter()

  const navigateToStorage = useCallback(() => {
    navigate(storage.id)
  }, [navigate, storage.id])

  const syncing = storage.type !== 'fs' && storage.sync != null

  const sync = useCallback(() => {
    if (user == null) {
      pushMessage({
        title: 'No User Error',
        description: 'Please login first to sync the storage.',
      })
      return
    }
    syncStorage(storage.id)
  }, [user, pushMessage, syncStorage, storage.id])

  const openStorageContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const menuItems: MenuItemConstructorOptions[] = [
        {
          type: 'normal',
          label: t('storage.rename'),
          click: async () => {
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
        { type: 'separator' },
        {
          type: 'normal',
          label: t('storage.remove'),
          click: async () => {
            messageBox({
              title: `Remove "${storage.name}" storage`,
              message:
                storage.type === 'fs'
                  ? "This operation won't delete the actual storage folder. You can add it to the app again."
                  : t('storage.removeMessage'),
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
      ]

      if (storage.type !== 'fs' && storage.cloudStorage != null) {
        menuItems.unshift({
          type: 'normal',
          label: 'Sync Storage',
          click: sync,
        })
      }

      openContextMenu({ menuItems })
    },
    [messageBox, prompt, renameStorage, removeStorage, storage, sync, t]
  )

  return (
    <Container
      title={storage.name}
      className={active ? 'active' : ''}
      onClick={navigateToStorage}
      onContextMenu={openStorageContextMenu}
    >
      <MainButton
        className={active ? 'active' : ''}
        onClick={navigateToStorage}
      >
        {storage.name.slice(0, 1)}
      </MainButton>
      {storage.type === 'pouch' && storage.cloudStorage != null && (
        <SyncButton className={syncing ? 'active' : ''} onClick={sync}>
          <Icon spin={syncing} path={mdiSync} />
        </SyncButton>
      )}
    </Container>
  )
}

export default AppNavigatorStorageItem
