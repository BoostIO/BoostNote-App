import { StyledProps } from '../../shared/lib/styled/styleFunctions'

export const uiTextColor = ({
  theme,
}: StyledProps) => `color: ${theme.colors.text.primary};
transition: 200ms color;
&:hover,
&:focus,
&:active,
&.active{
  color: ${theme.colors.text.subtle};
}
&:disabled {
  color: ${theme.colors.text.disabled};
}`
