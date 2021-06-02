import React, { useCallback } from 'react'
import { usePreferences } from '../../lib/preferences'
import { openContextMenu } from '../../lib/electronOnly'
import { MenuItemConstructorOptions } from 'electron'
import BottomBarButton from '../atoms/BottomBarButton'
import { mdiKeyboard } from '@mdi/js'
import Icon from '../../shared/components/atoms/Icon'

const EditorKeyMapSelect = () => {
  const { preferences, setPreferences } = usePreferences()
  const editorKeyMap = preferences['editor.keyMap']

  const openThemeContextMenu = useCallback(() => {
    openContextMenu({
      menuItems: (['default', 'emacs', 'vim'] as [
        'default',
        'emacs',
        'vim'
      ]).map((keyMap) => {
        return {
          type: 'radio',
          label: keyMap,
          checked: keyMap === editorKeyMap,
          click: () => {
            setPreferences({
              'editor.keyMap': keyMap,
            })
          },
        } as MenuItemConstructorOptions
      }),
    })
  }, [setPreferences, editorKeyMap])

  return (
    <BottomBarButton onClick={openThemeContextMenu}>
      <Icon path={mdiKeyboard} />
    </BottomBarButton>
  )
}

export default EditorKeyMapSelect
