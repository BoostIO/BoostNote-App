import { useEffect } from 'react'
import { osName } from './platform'

export const useGlobalKeyDownHandler = (
  handler: (event: KeyboardEvent) => void
) => {
  return useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handler])
}

export function isWithGeneralCtrlKey(
  event: KeyboardEvent | React.KeyboardEvent
) {
  switch (osName) {
    case 'macos':
      return event.metaKey
    default:
      return event.ctrlKey
  }
}
