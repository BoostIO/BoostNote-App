import React, { useMemo } from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../../../../shared/lib/dom'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../../../shared/lib/keyboard'
import { isFocusLeftSideShortcut } from '../../../../../shared/lib/shortcuts'
import { AppComponent } from '../../../../../shared/lib/types'

interface SidebarContextListProps {
  onBlur?: () => void
}

const SidebarContextList: AppComponent<SidebarContextListProps> = ({
  className,
  children,
  onBlur,
}) => {
  const listRef = React.createRef<HTMLDivElement>()
  useEffectOnce(() => {
    if (listRef.current != null) {
      listRef.current.focus()
    }
  })

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(listRef.current)
        return
      }
    }
  }, [listRef])
  useGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(listRef)

  const onBlurHandler = (event: any) => {
    if (onBlur == null) {
      return
    }

    if (
      event.relatedTarget == null ||
      listRef.current == null ||
      !listRef.current.contains(event.relatedTarget)
    ) {
      onBlur()
      return
    }
  }

  return (
    <div
      ref={listRef}
      className={className}
      tabIndex={0}
      onBlur={onBlurHandler}
    >
      {children}
    </div>
  )
}

export default SidebarContextList
