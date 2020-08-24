import styled from '../../lib/styled'
import {
  space,
  color,
  typography,
  SpaceProps,
  ColorProps,
  TypographyProps,
} from 'styled-system'

const Button = styled.button<SpaceProps & ColorProps & TypographyProps>`
  padding: 1em;
  display: inline-block;
  ${space}
  ${color}
  ${typography}

  border-radius: 4px;
  border: solid 1px ${({ theme }) => theme.colors.gray};
  white-space: nowrap;
  font-family: SFMono-Regular,Consolas,Liberation, Mono,Menlo,monospace;

  &:hover {
    cursor: pointer;
    transform: translateY(-3px);
    transition: .2s cubic-bezier(0, 0, .25, 1);
  }
  &:disabled {
    cursor: default;
    opacity: .5;
  }
`

export default Button
