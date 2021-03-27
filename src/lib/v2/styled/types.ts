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
  darker: string
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
}

export interface ChangingThemes {
  colors: {
    variants: {
      primary: VariantColorProps
      danger: VariantColorProps
      warning: VariantColorProps
      secondary: VariantColorProps
    }
    background: {
      main: string
      second: string
    }
    text: {
      main: string
      second: string
      subtle: string
      link: string
    }
    border: {
      main: string
      second: string
    }
    focus: string
  }
}

export type BaseTheme = SharedTheme & ChangingThemes

export type ThemeTypes = 'light' | 'dark'
