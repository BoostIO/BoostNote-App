import { darkTheme } from './dark'
import { lightTheme } from './light'
import { BaseTheme, ThemeTypes } from './types'

export interface StyledProps {
  theme: BaseTheme
}

export function selectV2Theme(theme: ThemeTypes) {
  switch (theme) {
    case 'light':
      return lightTheme
    case 'dark':
    default:
      return darkTheme
  }
}

/* ———————————–———————————–———————————–——–——
    Text
———————————–———————————–———————————–——–—— */

export const overflowEllipsis = () => `
  flex: 1 1 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

/* ———————————–———————————–———————————–——–——
    Icon
———————————–———————————–———————————–——–—— */

/* ———————————–———————————–———————————–——–——
    Spaces
———————————–———————————–———————————–——–—— */

/* ———————————–———————————–———————————–——–——
    Background
———————————–———————————–———————————–——–—— */

export const scrollbarOverlay = (
  { theme }: StyledProps,
  direction: 'x' | 'y',
  scrollingClassName: string
) => `
  overflow-${direction}: scroll;
  overflow-${direction}: overlay;

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: none !important;
    background-color: transparent;
  }
  &::-webkit-scrollbar,
  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  &::-webkit-scrollbar,
  &::-webkit-scrollbar-thumb,
  &::-webkit-scrollbar-track {
    transition: background 0.3s ease;
  }

  &.${scrollingClassName} {
    ${
      direction === 'x'
        ? 'scrollbar-height: thin; /* Firefox */'
        : 'scrollbar-width: thin; /* Firefox */'
    }
    -ms-overflow-style: none; /* IE 10+ */
  }

  &.${scrollingClassName}::-webkit-scrollbar-track {
    -webkit-box-shadow: none !important;
    background-color: ${theme.colors.background.tertiary};
  }

  &.${scrollingClassName}::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.background.quaternary};
  }
`

/* ———————————–———————————–———————————–——–——
    Border
———————————–———————————–———————————–——–—— */

export const hideScroll = () => `
  overflow-y: scroll;

  /* Firefox */
  scrollbar-width: none;

  /* Internet Explorer 10+ */
  -ms-overflow-style: none;
  
  /* WebKit */
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`

/* ———————————–———————————–———————————–——–——
    Shadow
———————————–———————————–———————————–——–—— */

/* ———————————–———————————–———————————–——–——
    Button
———————————–———————————–———————————–——–—— */

/* ———————————–———————————–———————————–——–——
    Form
———————————–———————————–———————————–——–—— */

export const contextMenuFormItem = (
  { theme }: StyledProps,
  focusClass: string
) => `
background: none;
border: 1px solid transparent;
padding: 2px 8px;
color: ${theme.colors.text.subtle};
&:hover {
  background: ${theme.colors.background.primary} !important;
}
&${focusClass} {
  background: ${theme.colors.background.primary} !important;
  border: 1px solid ${theme.colors.variants.info.base} !important;
}
`

/* ———————————–———————————–———————————–——–——
    Table
———————————–———————————–———————————–——–—— */

/* ———————————–———————————–———————————–——–——
    Responsive Styles
———————————–———————————–———————————–——–—— */

export const fromMobile = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.mobile}px
`

export const fromTablet = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.tablet}px
`

export const fromLaptop = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.laptop}px
`

export const fromDesktop = ({ theme }: StyledProps) => `
  min-width: ${theme.breakpoints.desktop}px
`

export const underMobile = ({ theme }: StyledProps) => `
  max-width: ${theme.breakpoints.mobile}px
`

export const underTablet = ({ theme }: StyledProps) => `
  max-width: ${theme.breakpoints.tablet}px
`

export const rightSidePageLayout = () => `
  width: 100%;
  max-width: 920px;
`
