import React, {
  useCallback,
  MouseEventHandler,
  useState,
  useRef,
  useEffect,
  FocusEventHandler,
} from 'react'
import { capitalize } from '../../../lib/utils/string'
import BottomBarButton from '../../atoms/BottomBarButton'
import {
  useSettings,
  GeneralEditorIndentType,
  GeneralEditorIndentSize,
} from '../../../lib/stores/settings'
import styled from '../../../lib/styled'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { selectStyle } from '../../../lib/styled/styleFunctions'
import { isChildNode } from '../../../lib/dom'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

const EditorIndentationStatus = () => {
  const { settings, setSettings } = useSettings()
  const currentIndentType = settings['general.editorIndentType']
  const currentIndentSize = settings['general.editorIndentSize']
  const [showingIndentMenu, setShowingIndentMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const showIndentMenu: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    setShowingIndentMenu(true)
  }, [])

  useEffect(() => {
    if (showingIndentMenu && menuRef.current != null) {
      menuRef.current.focus()
    }
  }, [showingIndentMenu])

  const handleMenuBlur: FocusEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (menuRef.current == null) {
        return
      }
      if (isChildNode(menuRef.current, event.relatedTarget as Node)) {
        menuRef.current.focus()
        return
      }
      setShowingIndentMenu(false)
    },
    []
  )

  const selectIndentType: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorIndentType': event.target
          .value as GeneralEditorIndentType,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeIndentType, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  const selectIndentSize: SelectChangeEventHandler = useCallback(
    (event) => {
      setSettings({
        'general.editorIndentSize': parseInt(
          event.target.value,
          10
        ) as GeneralEditorIndentSize,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeIndentSize, {
        theme: event.target.value,
      })
    },
    [setSettings]
  )

  return (
    <StyledContainer>
      <BottomBarButton onClick={showIndentMenu}>
        {capitalize(currentIndentType)}: {currentIndentSize}
      </BottomBarButton>
      {showingIndentMenu && (
        <div
          className='menu'
          tabIndex={-1}
          ref={menuRef}
          onBlur={handleMenuBlur}
        >
          <div className='menu__item'>
            <label className='menu__item__label' htmlFor='indentTypeSelect'>
              Indent Type
            </label>
            <select
              onChange={selectIndentType}
              id='indentTypeSelect'
              className='menu__item__select'
              value={currentIndentType}
            >
              <option value='spaces'>Spaces</option>
              <option value='tab'>Tab</option>
            </select>
          </div>
          <div className='menu__item'>
            <label className='menu__item__label' htmlFor='indentSizeSelect'>
              Indent Size
            </label>
            <select
              onChange={selectIndentSize}
              id='indentSizeSelect'
              className='menu__item__select'
              value={currentIndentSize}
            >
              <option value='2'>2</option>
              <option value='4'>4</option>
              <option value='8'>8</option>
            </select>
          </div>
        </div>
      )}
    </StyledContainer>
  )
}

export default EditorIndentationStatus

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .menu {
    position: absolute;
    border-radius: 5px;
    bottom: 30px;
    width: 150px;
    padding: ${({ theme }) => theme.space.xsmall}px;
    border: solid 1px ${({ theme }) => theme.baseBorderColor};
    background: ${({ theme }) => theme.baseBackgroundColor};
    right: 5px;
    z-index: 2;
  }
  .menu__item + .menu__item {
    margin-top: ${({ theme }) => theme.space.xsmall}px;
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
