import { BaseTheme } from './BaseTheme'

interface StyledProps {
  theme: BaseTheme
}

export interface TagStyleProps {
  color: string
}

export const backgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.backgroundColor};`

export const secondaryBackgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.secondaryBackgroundColor};`

export const activeBackgroundColor = ({ theme }: StyledProps) =>
  `background-color: ${theme.activeBackgroundColor};`

export const noteListIconColor = ({ theme }: StyledProps) => `
color: ${theme.noteListIconColor};
transition: 200ms color;
&:hover,
&:active,
&:focus {
  color: ${theme.noteListActiveIconColor};
}`

export const noteDetailIconColor = ({ theme }: StyledProps) => `
color: ${theme.noteDetailIconColor};
transition: 200ms color;
&:hover,
&:active,
&:focus {
  color: ${theme.noteDetailActiveIconColor};
}`

export const textColor = ({ theme }: StyledProps) =>
  `color: ${theme.textColor};`

export const disabledUiTextColor = ({ theme }: StyledProps) =>
  `color: ${theme.disabledUiTextColor};`

export const PrimaryTextColor = ({ theme }: StyledProps) =>
  `color: ${theme.primaryColor};`

export const uiTextColor = ({
  theme,
}: StyledProps) => `color: ${theme.uiTextColor};
transition: 200ms color;
&:hover,
&:focus,
&:active,
&.active{
  color: ${theme.textColor};
}
&:disabled {
  color: ${theme.disabledUiTextColor};
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
border: 1px solid ${theme.borderColor};
border-radius: 2px;
color: ${theme.textColor};
&:focus {
  box-shadow: 0 0 0 2px ${theme.primaryColor};
}
&::placeholder {
  color: ${theme.uiTextColor};
}
`

export const selectTabStyle = ({ theme }: StyledProps) =>
  `background-color: ${theme.backgroundColor};
border: none;
color: ${theme.uiTextColor};
cursor: pointer;
font-weight: 400;
&:hover,
&:focus,
&:active,
&.active{
  color: ${theme.textColor};
}
`

export const primaryButtonStyle = ({ theme }: StyledProps) => `border: none;
background-color: ${theme.primaryColor};
color: ${theme.primaryButtonLabelColor};
font-size: 13px;

&:hover,
&:active,
&.active {
  cursor: pointer;
}
&:focus {
  box-shadow: 0 0 0 2px ${theme.primaryColor};
}
&:disabled,
&.disabled {
  opacity: .5;
  cursor: default;
}
`

export const secondaryButtonStyle = ({ theme }: StyledProps) => `border: none;
background-color: ${theme.secondaryButtonBackgroundColor};
color: ${theme.secondaryButtonLabelColor};
border: 1px solid ${theme.borderColor};
font-size: 13px;

&:hover,
&:active,
&.active {
  cursor: pointer;
  color: ${theme.secondaryButtonHoverLabelColor};
  background-color: ${theme.primaryColor};
}
&:focus {
  box-shadow: 0 0 0 2px ${theme.primaryColor};
}
&:disabled,
&.disabled {
  opacity: .5;
  cursor: default;
}
`

export const selectStyle = ({
  theme,
}: StyledProps) => `background-color: ${theme.inputBackground};
border: 1px solid ${theme.borderColor};
border-radius: 2px;
color: ${theme.textColor};
&:focus {
  box-shadow: 0 0 0 2px ${theme.primaryColor};
}
`

export const tableStyle = ({ theme }: StyledProps) => `
border: 1px solid ${theme.borderColor};
border-collapse: collapse;
color: ${theme.textColor};
text-align: left;

th, td {
  padding: 16px 24px;
  border: 1px solid ${theme.borderColor};
  font-weight: 400;
}

thead th {
  font-size: 20px;
  font-weight: 500;

  span {
    display: block;
  }
}

tbody td {
  text-align: center;
}
`

export const textOverflow = () => `
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
`

export const flexCenter = () => `display: flex;
align-items: center;
justify-content: center;
`
