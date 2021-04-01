import React, { useCallback, useState, useRef } from 'react'
import { NoteStorage } from '../../lib/db/types'
import { flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { useDb } from '../../lib/db'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useTranslation } from 'react-i18next'
import { MenuItemConstructorOptions } from 'electron'
import { openContextMenu } from '../../lib/electronOnly'
import { useStorageRouter } from '../../lib/storageRouter'
import { osName } from '../../cloud/lib/utils/platform'

const Container = styled.div`
  ${flexCenter}
  position: relative;
  height: 48px;
  width: 48px;
  margin-bottom: 4px;
  border-radius: 14px;
  border-width: 3px;
  border-style: solid;
  border-color: transparent;

  &:first-child {
    margin-top: 10px;
  }
  &:hover {
    border-color: ${({ theme }) => theme.borderColor};
  }
  &.active {
    border-color: ${({ theme }) => theme.textColor};
  }

  & > .tooltip {
    display: flex;
    align-items: center;
    position: fixed;
    padding: 0 10px;
    border-radius: 4px;
    height: 36px;
    z-index: 1000;
    color: ${({ theme }) => theme.tooltipTextColor};
    background-color: ${({ theme }) => theme.tooltipBackgroundColor};
    user-select: none;

    .tooltip__icon {
      margin-right: 5px;
    }
    .tooltip__name {
      margin-right: 10px;
    }
    .tooltip__key {
    }
  }
`

const MainButton = styled.button`
  ${flexCenter}
  height: 36px;
  width: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  border: none;
  background-color: ${({ theme }) => theme.teamSwitcherBackgroundColor};
  border: 1px solid ${({ theme }) => theme.teamSwitcherBorderColor};
  color: ${({ theme }) => theme.teamSwitcherTextColor};
  font-size: 13px;

  &:active,
  &.active {
    background-color: ${({ theme }) => theme.teamSwitcherHoverBackgroundColor};
    color: ${({ theme }) => theme.teamSwitcherHoverTextColor};
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

interface AppNavigatorStorageItemProps {
  active: boolean
  storage: NoteStorage
  index: number
}

interface Position {
  top: number
  left: number
}

const AppNavigatorStorageItem = ({
  active,
  storage,
  index,
}: AppNavigatorStorageItemProps) => {
  const { renameStorage, removeStorage } = useDb()
  const { prompt, messageBox } = useDialog()
  const { t } = useTranslation()
  const { navigate } = useStorageRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState<Position | null>(null)

  const showTooltip = useCallback(() => {
    if (buttonRef.current == null) {
      return
    }
    const rect = buttonRef.current.getBoundingClientRect()
    setTooltipPosition({
      top: rect.top,
      left: rect.left + rect.width + 10,
    })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltipPosition(null)
  }, [])

  const navigateToStorage = useCallback(() => {
    navigate(storage.id)
  }, [navigate, storage.id])

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

      openContextMenu({ menuItems })
    },
    [messageBox, prompt, renameStorage, removeStorage, storage, t]
  )

  return (
    <Container
      className={active ? 'active' : ''}
      onClick={navigateToStorage}
      onContextMenu={openStorageContextMenu}
    >
      <MainButton
        className={active ? 'active' : ''}
        ref={buttonRef}
        onClick={navigateToStorage}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {storage.name.slice(0, 1)}
      </MainButton>
      {tooltipPosition != null && (
        <div className='tooltip' style={tooltipPosition}>
          <span className='tooltip__name'>{storage.name}</span>
          <span className='tooltip__key'>
            {osName === 'macos' ? '⌘' : 'Ctrl'} {index + 1}
          </span>
        </div>
      )}
    </Container>
  )
}

export default AppNavigatorStorageItem
