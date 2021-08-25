import React, { useMemo, useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { getFirstFocusableChildOfElement } from '../../lib/dom'
import { FormattingTool } from './types'
import {
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../lib/keyboard'
import {
  mdiFormatHeader1,
  mdiFormatHeader2,
  mdiFormatHeader3,
  mdiFormatHeader4,
  mdiFormatHeader5,
  mdiFormatHeader6,
} from '@mdi/js'
import ContextMenuItem from '../Topbar/Controls/ControlsContextMenu/ControlsContextMenuItem'
import { StyledEditorToolDropdownContainer } from './styled'
import styled from '../../../design/lib/styled'
import Icon from '../../../design/components/atoms/Icon'

interface EditorHeaderToolDropdownProps {
  onFormatCallback: (format: FormattingTool) => void
  closeDropdowndown: () => void
}

interface EditorHeaderToolDropdownOption {
  label: string
  format: FormattingTool
  icon: string
}

const options: EditorHeaderToolDropdownOption[] = [
  { label: 'Header 1', format: 'header1', icon: mdiFormatHeader1 },
  { label: 'Header 2', format: 'header2', icon: mdiFormatHeader2 },
  { label: 'Header 3', format: 'header3', icon: mdiFormatHeader3 },
  { label: 'Header 4', format: 'header4', icon: mdiFormatHeader4 },
  { label: 'Header 5', format: 'header5', icon: mdiFormatHeader5 },
  { label: 'Header 6', format: 'header6', icon: mdiFormatHeader6 },
]

const EditorHeaderToolDropdown = ({
  closeDropdowndown,
  onFormatCallback,
}: EditorHeaderToolDropdownProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffectOnce(() => {
    const focusableElement = getFirstFocusableChildOfElement(menuRef.current!)
    if (focusableElement == null) {
      menuRef.current!.focus()
    } else {
      focusableElement.focus()
    }
  })

  const onBlurHandler = (event: any) => {
    if (
      event.relatedTarget == null ||
      menuRef.current!.contains(event.relatedTarget)
    ) {
      return
    }
    closeDropdowndown()
  }

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEventOutsideOfInput(event, 'escape')) {
        preventKeyboardEventPropagation(event)
        closeDropdowndown()
      }
    }
  }, [closeDropdowndown])
  useGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(menuRef)

  return (
    <>
      <StyledEditorToolDropdownContainer ref={menuRef} onBlur={onBlurHandler}>
        {options.map((option) => (
          <ContextMenuItem
            key={option.label}
            label={
              <StyledMenuItem>
                <StyledIcon>
                  <Icon path={option.icon} size={20} />
                </StyledIcon>
                {option.label}
              </StyledMenuItem>
            }
            onClick={() => onFormatCallback(option.format)}
            id={`editor-toolbar-${option.format}`}
          />
        ))}
      </StyledEditorToolDropdownContainer>
    </>
  )
}

export default EditorHeaderToolDropdown

const StyledMenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  font-size: 21px;
`
