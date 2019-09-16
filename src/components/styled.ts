import styled from '../lib/styled'

export const StyledAppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: ${({ theme }) => theme.fontSize}px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  button,
  input {
    outline: none;
    &:focus {
      box-shadow: 0px 0px 0px 2px ${({ theme }) => theme.colors.active};
    }
  }
`

export const StyledNotFoundPage = styled.div`
  padding: 15px 25px;
`
