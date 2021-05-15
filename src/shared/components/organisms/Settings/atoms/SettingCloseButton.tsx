import styled from '../../../../lib/styled'

const SettingCloseButton = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.sizes.spaces.md}px;
  right: ${({ theme }) => theme.sizes.spaces.md}px;
  width: 26px;
  height: 26px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.icon.default};
  transition: 200ms color;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.icon.hover} !important;
  }

  &:active {
    color: ${({ theme }) => theme.colors.icon.active} !important;
  }

  &:disabled {
    &:hover,
    &:focus,
    &:active {
      cursor: not-allowed;
    }
  }
`

export default SettingCloseButton
