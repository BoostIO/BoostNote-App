import { useEffect, useMemo } from 'react'
import { osName } from '../platform'
import {
  isActiveElementAnInput,
  navigateToPreviousFocusableWithin,
  navigateToNextFocusableWithin,
} from './dom'

export const useGlobalKeyDownHandler = (
  handler: (event: KeyboardEvent) => void
) => {
  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [handler])
}

export const useUpDownNavigationListener = (
  listRef: React.RefObject<Element | null>
) => {
  const handler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (
        listRef.current == null ||
        !listRef.current.contains(document.activeElement)
      ) {
        return
      }

      if (isSingleKeyEvent(event, 'arrowdown')) {
        navigateToNextFocusableWithin(listRef.current, true)
        preventKeyboardEventPropagation(event)
        return
      }

      if (isSingleKeyEvent(event, 'arrowup')) {
        navigateToPreviousFocusableWithin(listRef.current, true)
        preventKeyboardEventPropagation(event)
        return
      }
    }
  }, [listRef])

  useGlobalKeyDownHandler(handler)
}

export function isWithGeneralCtrlKey(event: KeyboardEvent) {
  switch (osName) {
    case 'macos':
      return event.metaKey
    default:
      return event.ctrlKey
  }
}

export const MetaKeyText = () => {
  switch (osName) {
    case 'macos':
      return '⌘'
    case 'windows':
    case 'linux':
    default:
      return 'Ctrl'
  }
}

export function isSingleKeyEvent(event: KeyboardEvent, key: string) {
  return (
    event.key.toLowerCase() === key &&
    !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
  )
}

export function isSingleKeyEventOutsideOfInput(
  event: KeyboardEvent,
  key: string
) {
  return isSingleKeyEvent(event, key) && !isActiveElementAnInput()
}

export function preventKeyboardEventPropagation(event: KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  try {
    event.stopImmediatePropagation()
  } catch (error) {}
}
