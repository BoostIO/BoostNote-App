import React, {
  useCallback,
  FocusEventHandler,
  useState,
  useRef,
  MouseEventHandler,
  useEffect,
} from 'react'
import BottomBarButton from '../BottomBarButton'
import { mdiPaletteOutline } from '@mdi/js'
import {
  codeMirrorEditorThemes,
  useSettings,
  CodeMirrorEditorTheme,
} from '../../lib/stores/settings'
import { isChildNode } from '../../lib/dom'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import { SimpleFormSelect } from '../../../design/components/molecules/Form/atoms/FormSelect'
import styled from '../../../design/lib/styled'
import Icon from '../../../design/components/atoms/Icon'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import Form from '../../../design/components/molecules/Form'

const EditorThemeSelect = () => {
  const { settings, setSettings } = useSettings()
  const editorTheme = settings['general.editorTheme']
  const codeBlockTheme = settings['general.codeBlockTheme']

  const { translate } = useI18n()

  const [showingMenu, setShowingMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const showIndentMenu: MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
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
        return
      }
      setShowingMenu(false)
    },
    []
  )

  const selectEditorTheme = useCallback(
    (val: string) => {
      setSettings({
        'general.editorTheme': val as CodeMirrorEditorTheme,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeEditor, {
        theme: val,
      })
    },
    [setSettings]
  )

  const selectCodeBlockTheme = useCallback(
    (val: string) => {
      setSettings({
        'general.codeBlockTheme': val as CodeMirrorEditorTheme,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeCodeblock, {
        theme: val,
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
          <Form>
            <FormRow
              className='menu__item'
              fullWidth={true}
              row={{
                title: (
                  <label className='menu__item__label' htmlFor='editorTheme'>
                    {translate(lngKeys.SettingsEditorTheme)}
                  </label>
                ),
              }}
            >
              <FormRowItem>
                <SimpleFormSelect
                  onChange={selectEditorTheme}
                  id='editorTheme'
                  className='menu__item__select'
                  value={editorTheme}
                  options={codeMirrorEditorThemes}
                />
              </FormRowItem>
            </FormRow>
            <FormRow
              className='menu__item'
              fullWidth={true}
              row={{
                title: (
                  <label className='menu__item__label' htmlFor='codeBlockTheme'>
                    {translate(lngKeys.SettingsCodeBlockTheme)}
                  </label>
                ),
              }}
            >
              <FormRowItem>
                <SimpleFormSelect
                  onChange={selectCodeBlockTheme}
                  id='codeBlockTheme'
                  className='menu__item__select'
                  value={codeBlockTheme}
                  options={codeMirrorEditorThemes}
                />
              </FormRowItem>
            </FormRow>
          </Form>
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
    border: solid 1px ${({ theme }) => theme.colors.border.main};
    background: ${({ theme }) => theme.colors.background.primary};
    z-index: 2;
    right: 5px;
  }
  .menu__item__label {
    overflow: nowrap;
    display: block;
    margin-bottom: 0;
  }
`
