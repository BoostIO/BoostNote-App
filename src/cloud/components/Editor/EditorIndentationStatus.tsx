import React, {
  useCallback,
  MouseEventHandler,
  useState,
  useRef,
  useEffect,
  FocusEventHandler,
} from 'react'
import { capitalize } from '../../lib/utils/string'
import BottomBarButton from '../BottomBarButton'
import {
  useSettings,
  GeneralEditorIndentType,
  GeneralEditorIndentSize,
} from '../../lib/stores/settings'
import { isChildNode } from '../../lib/dom'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import styled from '../../../design/lib/styled'
import FormSelect, {
  FormSelectOption,
  SimpleFormSelect,
} from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import Form from '../../../design/components/molecules/Form'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'

const EditorIndentationStatus = () => {
  const { settings, setSettings } = useSettings()
  const currentIndentType = settings['general.editorIndentType']
  const currentIndentSize = settings['general.editorIndentSize']
  const [showingIndentMenu, setShowingIndentMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { translate } = useI18n()

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
        return
      }
      setShowingIndentMenu(false)
    },
    []
  )

  const selectIndentType = useCallback(
    (option: FormSelectOption) => {
      setSettings({
        'general.editorIndentType': option.value as GeneralEditorIndentType,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeIndentType, {
        theme: option.value,
      })
    },
    [setSettings]
  )

  const selectIndentSize = useCallback(
    (val: string) => {
      setSettings({
        'general.editorIndentSize': parseInt(
          val,
          10
        ) as GeneralEditorIndentSize,
      })
      trackEvent(MixpanelActionTrackTypes.ThemeChangeIndentSize, {
        theme: val,
      })
    },
    [setSettings]
  )

  return (
    <StyledContainer>
      <BottomBarButton onClick={showIndentMenu}>
        {capitalize(
          currentIndentType === 'spaces'
            ? translate(lngKeys.GeneralSpaces)
            : translate(lngKeys.GeneralTabs)
        )}
        : {currentIndentSize}
      </BottomBarButton>
      {showingIndentMenu && (
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
                  <label
                    className='menu__item__label'
                    htmlFor='indentTypeSelect'
                  >
                    {translate(lngKeys.SettingsIndentType)}
                  </label>
                ),
              }}
            >
              <FormRowItem>
                <FormSelect
                  onChange={selectIndentType}
                  id='indentTypeSelect'
                  className='menu__item__select'
                  value={{
                    value: currentIndentType,
                    label:
                      currentIndentType === 'spaces'
                        ? translate(lngKeys.GeneralSpaces)
                        : translate(lngKeys.GeneralTabs),
                  }}
                  options={[
                    {
                      value: 'spaces',
                      label: translate(lngKeys.GeneralSpaces),
                    },
                    { value: 'tab', label: translate(lngKeys.GeneralTabs) },
                  ]}
                />
              </FormRowItem>
            </FormRow>
            <FormRow
              className='menu__item'
              fullWidth={true}
              row={{
                title: (
                  <label
                    className='menu__item__label'
                    htmlFor='indentSizeSelect'
                  >
                    {translate(lngKeys.SettingsIndentSize)}
                  </label>
                ),
              }}
            >
              <FormRowItem>
                <SimpleFormSelect
                  onChange={selectIndentSize}
                  id='indentSizeSelect'
                  className='menu__item__select'
                  value={currentIndentSize.toString()}
                  options={['2', '4', '8']}
                />
              </FormRowItem>
            </FormRow>
          </Form>
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
    width: 200px;
    padding: 5px;
    border: solid 1px ${({ theme }) => theme.colors.border.main};
    background: ${({ theme }) => theme.colors.background.primary};
    right: 5px;
    z-index: 2;
  }

  .menu__item__label {
    overflow: nowrap;
    display: block;
    margin-bottom: 0;
  }
`
