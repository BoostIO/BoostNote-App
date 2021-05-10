import styled from '../../../../lib/styled'

const SettingIconInputLabel = styled.label`
  position: relative;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.sizes.spaces.md}px;

  & > span {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 ${({ theme }) => theme.sizes.spaces.md}px;
    background-color: ${({ theme }) => theme.colors.variants.secondary.base};
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.variants.secondary.text};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    transition: 200ms background-color;

    &.focus {
      filter: brightness(103%);
    }
    &:hover {
      filter: brightness(106%);
    }
    &:active,
    &.button__state--active {
      filter: brightness(112%);
    }
  }

  & > input[type='file'] {
    position: absolute;
    opacity: 0;
    height: 0px;
    width: 0px;
  }
`

export default SettingIconInputLabel
