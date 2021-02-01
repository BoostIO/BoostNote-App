import React, {
  useCallback,
  FocusEventHandler,
  useState,
  useRef,
  MouseEventHandler,
  useEffect,
} from 'react'
import BottomBarButton from '../../atoms/BottomBarButton'
import Icon from '../../atoms/Icon'
import { mdiPaletteOutline } from '@mdi/js'
import {
  codeMirrorEditorThemes,
  useSettings,
  CodeMirrorEditorTheme,
} from '../../../lib/stores/settings'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import styled from '../../../lib/styled'
import { selectStyle } from '../../../lib/styled/styleFunctions'
import { isChildNode } from '../../../lib/dom'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

const EditorThemeSelect = () => {
  const { settings, setSettings } = useSettings()
  const editorTheme = settings['general.editorTheme']
  const codeBlockTheme = settings['general.codeBlockTheme']

  const [showingMenu, setShowingMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const showIndentMenu: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    setShowingMenu(true)
  }, [])

  useEffect(() => {
    if (showingMenu && menuRef.current != null) {
      menuRef.current.focus()
    }
  }, [showingMenu])

  const handleMenuBlur: FocusEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (menuRef.current == null) {
        return
      }
      if (isChildNode(menuRef.current, event.relatedTarget as Node)) {
        menuRef.current.focus()
        return
      }
      setShowingMenu(false)
    },
    []
  )

  const selectIndentType: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorTheme': event.target.value as CodeMirrorEditorTheme,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeEditor, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  const selectIndentSize: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.codeBlockTheme': event.target.value as CodeMirrorEditorTheme,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeCodeblock, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  return (
    <StyledContainer>
      <BottomBarButton onClick={showIndentMenu}>
        <Icon path={mdiPaletteOutline} />
      </BottomBarButton>
      {showingMenu && (
        <div
          className='menu'
          tabIndex={-1}
          ref={menuRef}
          onBlur={handleMenuBlur}
        >
          <div className='menu__item'>
            <label className='menu__item__label' htmlFor='editorTheme'>
              Editor Theme
            </label>
            <select
              onChange={selectIndentType}
              id='editorTheme'
              className='menu__item__select'
              value={editorTheme}
            >
              {codeMirrorEditorThemes.map((theme) => {
                return (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                )
              })}
            </select>
          </div>
          <div className='menu__item'>
            <label className='menu__item__label' htmlFor='codeBlockTheme'>
              Code Block Theme
            </label>
            <select
              onChange={selectIndentSize}
              id='codeBlockTheme'
              className='menu__item__select'
              value={codeBlockTheme}
            >
              {codeMirrorEditorThemes.map((theme) => {
                return (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      )}
    </StyledContainer>
  )
}

export default EditorThemeSelect

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .menu {
    position: absolute;
    border-radius: 5px;
    bottom: 30px;
    padding: 5px;
    border: solid 1px ${({ theme }) => theme.baseBorderColor};
    background: ${({ theme }) => theme.baseBackgroundColor};
    z-index: 2;
    right: 5px;
  }
  .menu__item__label {
    overflow: nowrap;
    display: block;
    font-size: ${({ theme }) => theme.xxsmall}px;
    margin-bottom: 0;
  }
  .menu__item__select {
    width: 100%;
    display: block;
    ${selectStyle}
    padding: 5px;
    border-radius: 5px;
  }
`
