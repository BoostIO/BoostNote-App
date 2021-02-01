import { useEffect, useMemo } from 'react'
import { osName } from './utils/platform'
import {
  isActiveElementAnInput,
  navigateToPreviousFocusableWithin,
  navigateToNextFocusableWithin,
  focusFirstChildFromElement,
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

export const useCapturingGlobalKeyDownHandler = (
  handler: (event: KeyboardEvent) => void
) => {
  return useEffect(() => {
    document.addEventListener('keydown', handler, { capture: true })
    return () => {
      document.removeEventListener('keydown', handler, { capture: true })
    }
  }, [handler])
}

export const useContextMenuKeydownHandler = (
  listRef: React.RefObject<Element | null>
) => {
  const handler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (listRef.current == null) {
        return
      }

      if (isSingleKeyEvent(event, 'arrowdown')) {
        if (!listRef.current.contains(document.activeElement)) {
          focusFirstChildFromElement(listRef.current as HTMLDivElement)
          return
        }

        navigateToNextFocusableWithin(listRef.current, true)
        preventKeyboardEventPropagation(event)
        return
      }

      if (isSingleKeyEvent(event, 'arrowup')) {
        if (!listRef.current.contains(document.activeElement)) {
          return
        }
        navigateToPreviousFocusableWithin(listRef.current, true)
        preventKeyboardEventPropagation(event)
        return
      }
    }
  }, [listRef])

  useCapturingGlobalKeyDownHandler(handler)
}

export const useUpDownNavigationListener = (
  listRef: React.RefObject<Element | null>,
  options: { inactive?: boolean; overrideInput?: boolean } = {
    inactive: false,
  }
) => {
  const handler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (options.inactive) {
        return
      }

      if (options.overrideInput == null || !options.overrideInput) {
        if (isActiveElementAnInput()) {
          return
        }
      }

      if (isSingleKeyEvent(event, 'arrowdown')) {
        if (
          listRef.current == null ||
          !listRef.current.contains(document.activeElement)
        ) {
          return
        }
        navigateToNextFocusableWithin(listRef.current)
        preventKeyboardEventPropagation(event)
        return
      }

      if (isSingleKeyEvent(event, 'arrowup')) {
        if (
          listRef.current == null ||
          !listRef.current.contains(document.activeElement)
        ) {
          return
        }
        navigateToPreviousFocusableWithin(listRef.current)
        preventKeyboardEventPropagation(event)
        return
      }
    }
  }, [listRef, options.inactive, options.overrideInput])

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
