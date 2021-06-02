import { SharedTheme } from './types'

const commonTheme: SharedTheme = {
  breakpoints: {
    mobile: 425,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
  },
  borders: {
    radius: 4,
  },
  fonts: {
    family: `Lato, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif`,
  },
  sizes: {
    forms: {
      input: 32,
    },
    fonts: {
      xsm: 10,
      sm: 11,
      df: 13,
      md: 15,
      l: 21,
      xl: 32,
    },
    spaces: {
      xsm: 4,
      sm: 8,
      df: 12,
      md: 22,
      l: 32,
      xl: 40,
    },
  },

  // Search & Selection specific colors
  codeEditorMarkedTextBackgroundColor: '#ffdb70',
  codeEditorSelectedTextBackgroundColor: '#ffc107',
}

export default commonTheme
