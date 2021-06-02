enum BreakPoints {
  mobile = 'mobile',
  tablet = 'tablet',
  laptop = 'laptop',
  desktop = 'desktop',
}

enum Sizes {
  xsm = 'xsm',
  sm = 'sm',
  df = 'df',
  md = 'md',
  l = 'l',
  xl = 'xl',
}

interface VariantColorProps {
  base: string
  text: string
}

export interface SharedTheme {
  breakpoints: {
    [key in BreakPoints]: number
  }
  borders: {
    radius: number
  }
  fonts: {
    family: string
  }
  sizes: {
    forms: {
      input: number
    }
    spaces: {
      [key in Sizes]: number
    }
    fonts: {
      [key in Sizes]: number
    }
  }

  codeEditorMarkedTextBackgroundColor: string
  codeEditorSelectedTextBackgroundColor: string
}

/** background color gradient => starting from main color, fade more and more towards the opposite BW ***/
export interface ChangingThemes {
  colors: {
    variants: {
      primary: VariantColorProps
      secondary: VariantColorProps
      tertiary: VariantColorProps
      danger: VariantColorProps
      warning: VariantColorProps
      success: VariantColorProps
      info: VariantColorProps
    }
    icon: {
      default: string
      hover: string
      active: string
    }
    background: {
      primary: string
      secondary: string
      tertiary: string
      quaternary: string
    }
    text: {
      primary: string
      secondary: string
      subtle: string
      link: string
      disabled: string
    }
    border: {
      main: string
      second: string
    }
    shadow: string
  }
}

export type BaseTheme = SharedTheme & ChangingThemes

export type ThemeTypes = 'light' | 'dark'
