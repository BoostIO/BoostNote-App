import styled, { ThemedBaseStyledInterface } from 'styled-components'

export const defaultTheme = {
  space: [0, 5, 10, 16, 24, 32, 40, 48, 56, 64, 120],
  colors: {
    teal: '#005868',
    navy: '#0A2342',
    white: '#FFFFFF',
    lightGray: '#F3F4F7',
    gray: 'rgba(12,24,39,.64)',
    black: '#0B1118',
  },
  fontSizes: [14, 16, 18, 24, 32, 40, 48],
}

export type BaseTheme = typeof defaultTheme

export default styled as ThemedBaseStyledInterface<BaseTheme>
