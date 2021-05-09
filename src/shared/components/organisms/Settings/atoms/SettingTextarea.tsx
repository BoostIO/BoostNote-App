import styled from '../../../../lib/styled'

const SettingTextarea = styled.textarea`
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%;
  height: 200px;
  max-width: 400px;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  resize: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.variants.primary.base};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

export default SettingTextarea
