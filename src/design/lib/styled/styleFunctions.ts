import { darkTheme } from './dark'
import { lightTheme } from './light'
import { sepiaTheme } from './sepia'
import { solarizedDarkTheme } from './solarizedDark'
import { draculaTheme } from './dracula'
import { monokaiTheme } from './monokai'
import { BaseTheme, ThemeTypes } from './types'

export interface StyledProps {
  theme: BaseTheme
}

export function selectV2Theme(theme: ThemeTypes) {
  switch (theme) {
    case 'light':
      return lightTheme
    case 'sepia':
      return sepiaTheme
    case 'monokai':
      return monokaiTheme
    case 'solarizedDark':
      return solarizedDarkTheme
    case 'dracula':
      return draculaTheme
    case 'dark':
    default:
      return darkTheme
  }
}

/* ———————————–———————————–———————————–——–——
    Text
———————————–———————————–———————————–——–—— */
export const textColor = ({ theme }: StyledProps) =>
  `color: ${theme.colors.text.primary};`

export const textOverflow = () => `
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
`

export const overflowEllipsis = () => `
  flex: 1 1 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

/* ———————————–———————————–———————————–——–——
    Icon
———————————–———————————–———————————–——–—— */

export const userIconStyle = ({ theme }: StyledProps) => `
  display: flex;
  justify-content: center;
  margin-right: ${theme.sizes.spaces.xsm * -1}px;
  background-color: ${theme.colors.background.primary};
  border: 1px solid transparent;
  border-radius: 100%;
  color: ${theme.colors.text.link};
  line-height: 24px;
  overflow: hidden;
  text-align: center;

  img,
  .icon {
    width: 100%;
    height: 100%;
    border-radius: 100%;
    object-fit: cover;
  }
`

/* ———————————–———————————–———————————–——–——
    Spaces
———————————–———————————–———————————–——–—— */

/* ———————————–———————————–———————————–——–——
    Background
———————————–———————————–———————————–——–—— */
export const activeBackgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.colors.background.tertiary};`

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
export const borderColor = ({ theme }: StyledProps) =>
  `border-color: ${theme.colors.border.main};`

export const backgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.colors.background.primary};`

export const border = ({ theme }: StyledProps) =>
  `border: 1px solid ${theme.colors.border.main};`

export const borderBottom = ({ theme }: StyledProps) =>
  `border-bottom: 1px solid ${theme.colors.border.main};`

export const borderLeft = ({ theme }: StyledProps) =>
  `border-left: 1px solid ${theme.colors.border.main};`

export const borderTop = ({ theme }: StyledProps) =>
  `border-top: 1px solid ${theme.colors.border.main};`

export const borderRight = ({ theme }: StyledProps) =>
  `border-right: 1px solid  ${theme.colors.border.main};`

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
export const contextMenuShadow = ({ theme }: StyledProps) =>
  `box-shadow: ${theme.colors.shadow};`

/* ———————————–———————————–———————————–——–——
    Button
———————————–———————————–———————————–——–—— */
export const closeIconColor = ({ theme }: StyledProps) => `
color: ${theme.colors.text.subtle};
transition: 200ms color;
&:hover,
&:active,
&:focus {
  color: ${theme.colors.text.link};
}`

/* ———————————–———————————–———————————–——–——
    Form
———————————–———————————–———————————–——–—— */
export const selectStyle = ({
  theme,
}: StyledProps) => `background-color: ${theme.colors.background.tertiary};
border: 1px solid ${theme.colors.border.main};
border-radius: 2px;
color: ${theme.colors.text.primary};
&:focus {
  box-shadow: 0 0 0 2px ${theme.colors.background.primary};
}
`

export const contextMenuFormItem = (
  { theme }: StyledProps,
  focusClass: string
) => `
background: none;
border: 1px solid transparent;
padding: 2px 8px;
&:hover {
  background: ${theme.colors.background.primary} !important;
}
&${focusClass} {
  background: ${theme.colors.background.primary} !important;
  border: 1px solid ${theme.colors.variants.info.base} !important;
}`

export const formInputHeight = () => `
  height: 32px;
  min-height: 32px;
`

export const inputStyle = ({ theme }: StyledProps) =>
  `background-color: ${theme.colors.background.quaternary};
border: 1px solid ${theme.colors.border.main};
border-radius: 2px;
color: ${theme.colors.text.primary};
&:focus {
  box-shadow: 0 0 0 2px ${theme.colors.background.primary};
}
&::placeholder {
  color: ${theme.colors.text.primary};
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

export const flexCenter = () => `display: flex;
align-items: center;
justify-content: center;
`
