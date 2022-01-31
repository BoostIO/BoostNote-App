import { useMemo } from 'react'
import { selectV2Theme } from '../../../../design/lib/styled/styleFunctions'
import { useSettings } from '../settings'

export function useLoaderStore(): {
  backgroundColor: string
  foregroundColor: string
  speed: number
  rx: number
  ry: number
} {
  const { settings } = useSettings()

  const colors = useMemo(() => {
    const theme = selectV2Theme(settings['general.theme'] || 'dark')

    return {
      backgroundColor: theme.colors.background.tertiary,
      foregroundColor: theme.colors.text.subtle,
    }
  }, [settings])

  return {
    backgroundColor: colors.backgroundColor,
    foregroundColor: colors.foregroundColor,
    speed: 6,
    rx: 6,
    ry: 6,
  }
}
