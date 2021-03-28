import React, { useMemo } from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../../../../lib/v2/dom'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
  useUpDownNavigationListener,
} from '../../../../../lib/v2/keyboard'
import { isFocusLeftSideShortcut } from '../../../../../lib/v2/shortcuts'
import { AppComponent } from '../../../../../lib/v2/types'

const SidebarContextList: AppComponent<{}> = ({ className, children }) => {
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

  return (
    <div ref={listRef} className={className} tabIndex={0}>
      {children}
    </div>
  )
}

export default SidebarContextList
