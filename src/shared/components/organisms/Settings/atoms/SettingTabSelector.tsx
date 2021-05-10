import styled from '../../../../lib/styled'

const SettingTabSelector = styled.div`
  display: flex;

  button {
    padding: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text.subtle};
    cursor: pointer;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
    outline: none;

    &:hover {
      color: ${({ theme }) => theme.colors.text.secondary};
    }

    &.active {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  button:first-of-type {
    margin-right: ${({ theme }) => theme.sizes.spaces.xl}px;
  }
`

export default SettingTabSelector
