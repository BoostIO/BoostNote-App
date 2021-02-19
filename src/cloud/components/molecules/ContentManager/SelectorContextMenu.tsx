import React, { useMemo } from 'react'
import {
  useGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
  preventKeyboardEventPropagation,
  useContextMenuKeydownHandler,
} from '../../../lib/keyboard'
import { useEffectOnce } from 'react-use'
import ControlsContextMenuBackground from '../../organisms/Topbar/Controls/ControlsContextMenu/ControlsContextMenuBackground'
import {
  StyledContextMenuContainer,
  Scrollable,
} from '../../organisms/Topbar/Controls/ControlsContextMenu/styled'
import ContextMenuItem from '../../organisms/Topbar/Controls/ControlsContextMenu/ControlsContextMenuItem'
import { SeletorAction } from './Selector'

interface SelectorContextMenuProps {
  actions: SeletorAction[]
  closeContextMenu: () => void
}

const SelectorContextMenu = ({
  closeContextMenu,
  actions,
}: SelectorContextMenuProps) => {
  const menuRef = React.createRef<HTMLDivElement>()
  useEffectOnce(() => {
    menuRef.current!.focus()
  })

  const onBlurHandler = (event: any) => {
    if (
      !(
        menuRef.current == null ||
        event.relatedTarget == null ||
        !menuRef.current.contains(event.relatedTarget)
      )
    ) {
      return
    }
    closeContextMenu()
  }

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isSingleKeyEventOutsideOfInput(event, 'escape')) {
        preventKeyboardEventPropagation(event)
        closeContextMenu()
      }
    }
  }, [closeContextMenu])
  useGlobalKeyDownHandler(keydownHandler)
  useContextMenuKeydownHandler(menuRef)

  return (
    <>
      <ControlsContextMenuBackground closeContextMenu={closeContextMenu} />
      <StyledContextMenuContainer
        ref={menuRef}
        onBlur={onBlurHandler}
        className='left'
      >
        <Scrollable>
          {actions.map((action, i) => (
            <ContextMenuItem
              key={i}
              onClick={() => {
                if (action.onClick != null) {
                  action.onClick()
                }
                closeContextMenu()
              }}
              label={action.label}
              id={`selector-context-${i}`}
              disabled={action.disabled}
            />
          ))}
        </Scrollable>
      </StyledContextMenuContainer>
    </>
  )
}

export default SelectorContextMenu
