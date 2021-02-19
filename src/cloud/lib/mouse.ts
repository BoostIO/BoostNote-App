import { useEffect } from 'react'

export const useGlobalMouseMoveHandler = (
  handler: (event: MouseEvent) => void
) => {
  return useEffect(() => {
    window.addEventListener('mousemove', handler)
    return () => {
      window.removeEventListener('mousemove', handler)
    }
  }, [handler])
}
