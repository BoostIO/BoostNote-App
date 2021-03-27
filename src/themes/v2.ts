export type ThemeTypes = 'light' | 'dark'
export function selectTheme(theme: string) {
  switch (theme) {
    case 'light':
      return lightTheme
    case 'dark':
    default:
      return darkTheme
  }
}
