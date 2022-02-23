import React, { useCallback, useState, useRef, useEffect } from 'react'
import { mdiKeyboard } from '@mdi/js'
import { CodeMirrorKeyMap, useSettings } from '../../lib/stores/settings'
import BottomBarButton from '../BottomBarButton'
import { isChildNode } from '../../lib/dom'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import styled from '../../../design/lib/styled'
import { SimpleFormSelect } from '../../../design/components/molecules/Form/atoms/FormSelect'
import Icon from '../../../design/components/atoms/Icon'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'

const EditorKeyMapSelect = () => {
  const { setSettings, settings } = useSettings()
  const generalEditorKeyMap = settings['general.editorKeyMap']
  const [showingMenu, setShowingMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { translate } = useI18n()

  const showMenu: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
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
        return
      }
      setShowingMenu(false)
    },
    []
  )

  const selectIndentType = useCallback(
    (val: string) => {
      setSettings({
        'general.editorKeyMap': val as CodeMirrorKeyMap,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeKeymap, {
        theme: val,
      })
    },
    [setSettings]
  )

  return (
    <StyledContainer>
      <BottomBarButton onClick={showMenu}>
        <Icon path={mdiKeyboard} size={16} />
      </BottomBarButton>
      {showingMenu && (
        <div
          className='menu'
          tabIndex={-1}
          ref={menuRef}
          onBlur={handleMenuBlur}
        >
          <FormRow
            className='menu__item'
            fullWidth={true}
            row={{
              title: (
                <label
                  className='menu__item__label'
                  htmlFor='editorKeymapSelect'
                >
                  {translate(lngKeys.SettingsEditorKeyMap)}
                </label>
              ),
            }}
          >
            <FormRowItem>
              <SimpleFormSelect
                onChange={selectIndentType}
                id='editorKeymapSelect'
                className='menu__item__select'
                value={generalEditorKeyMap}
                options={['default', 'emacs', 'vim']}
              />
            </FormRowItem>
          </FormRow>
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
    position: absolute;
    z-index: 2;
    border-radius: 5px;
    bottom: 30px;
    padding: 5px;
    border: solid 1px ${({ theme }) => theme.colors.border.main};
    background: ${({ theme }) => theme.colors.background.primary};
    right: 5px;
  }
  .menu__item__label {
    overflow: nowrap;
    display: block;
    margin-bottom: 0;
  }
`

export default EditorKeyMapSelect
