import styled from '../../../../lib/styled'

const SettingTabButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.md}px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  text-align: left;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`

export default SettingTabButton
