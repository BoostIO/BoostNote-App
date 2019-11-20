import { BaseTheme } from './themes/types'

interface StyledProps {
  theme: BaseTheme
}

export const backgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.backgroundColor};`

export const secondaryBackgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.secondaryBackgroundColor};`

export const activeBackgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.activeBackgroundColor};`

export const iconColor = ({ theme }: StyledProps) => `color: ${theme.iconColor};
&:hover,
&:focus,
&:active,
&.active {
  color: ${theme.activeIconColor};
}`

export const textColor = ({ theme }: StyledProps) =>
  `color: ${theme.textColor};`

export const uiTextColor = ({
  theme
}: StyledProps) => `color: ${theme.uiTextColor};
transition: 200ms color;
&:hover,
&:focus,
&:active,
&.active {
  color: ${theme.activeUiTextColor};
}`

export const borderColor = ({ theme }: StyledProps) =>
  `border-color: ${theme.borderColor};`

export const border = ({ theme }: StyledProps) =>
  `border: 1px solid ${theme.borderColor};`

export const borderBottom = ({ theme }: StyledProps) =>
  `border-bottom: 1px solid ${theme.borderColor};`

export const borderTop = ({ theme }: StyledProps) =>
  `border-top: 1px solid ${theme.borderColor};`

export const borderLeft = ({ theme }: StyledProps) =>
  `border-left: 1px solid ${theme.borderColor};`

export const borderRight = ({ theme }: StyledProps) =>
  `border-right: 1px solid ${theme.borderColor};`

export const contextMenuShadow = ({ theme }: StyledProps) =>
  `box-shadow: ${theme.shadow};`

export const inputStyle = ({ theme }: StyledProps) =>
  `background-color: ${theme.inputBackground};
border: none;
border-radius: 4px;
color: ${theme.textColor};
&:focus {
  box-shadow: 0 0 0 2px ${theme.primaryColor};
}
`

export const secondaryButtonStyle = ({
  theme
}: StyledProps) => `border: ${theme.borderColor};
background-color: ${theme.inputBackground};
color: ${theme.textColor};
&:focus {
  box-shadow: 0 0 0 2px ${theme.primaryColor};
}
&:active,
&.active {
  background-color: ${theme.primaryColor};
}
`
