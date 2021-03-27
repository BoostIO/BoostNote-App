import React, { useCallback, useState, useRef, useEffect } from 'react'
import { mdiKeyboard } from '@mdi/js'
import Icon from '../../atoms/Icon'
import { CodeMirrorKeyMap, useSettings } from '../../../lib/stores/settings'
import BottomBarButton from '../../atoms/BottomBarButton'
import styled from '../../../lib/styled'
import { isChildNode } from '../../../lib/dom'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { selectStyle } from '../../../lib/styled/styleFunctions'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

const EditorKeyMapSelect = () => {
  const { setSettings, settings } = useSettings()
  const generalEditorKeyMap = settings['general.editorKeyMap']
  const [showingMenu, setShowingMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const showMenu: React.MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    setShowingMenu(true)
  }, [])

  useEffect(() => {
    if (showingMenu && menuRef.current != null) {
      menuRef.current.focus()
    }
  }, [showingMenu])

  const handleMenuBlur: React.FocusEventHandler<HTMLDivElement> = useCallback(
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
        'general.editorKeyMap': event.target.value as CodeMirrorKeyMap,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeKeymap, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  return (
    <StyledContainer>
      <BottomBarButton onClick={showMenu}>
        <Icon path={mdiKeyboard} />
      </BottomBarButton>
      {showingMenu && (
        <div
          className='menu'
          tabIndex={-1}
          ref={menuRef}
          onBlur={handleMenuBlur}
        >
          <div className='menu__item'>
            <label className='menu__item__label' htmlFor='editorKeymapSelect'>
              Editor Keymap
            </label>
            <select
              onChange={selectIndentType}
              id='editorKeymapSelect'
              className='menu__item__select'
              value={generalEditorKeyMap}
            >
              <option value='default'>default</option>
              <option value='emacs'>emacs</option>
              <option value='vim'>vim</option>
            </select>
          </div>
        </div>
      )}
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  .menu {
    position: absolute
    z-index: 2;
    border-radius: 5px;
    bottom: 30px;
    padding: 5px;
    border: solid 1px ${({ theme }) => theme.baseBorderColor};
    background: ${({ theme }) => theme.baseBackgroundColor};
    right: 5px;
  }
  .menu__item__label {
    overflow: nowrap;
    display: block;
    font-size: ${({ theme }) => theme.space.xxsmall}px;
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

export default EditorKeyMapSelect
