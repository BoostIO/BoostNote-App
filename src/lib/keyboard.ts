import { useEffect } from 'react'

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
