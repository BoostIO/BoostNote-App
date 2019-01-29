import styled from '../lib/styled'

export const StyledAppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  font-size: ${({ theme }) => theme.app.fontSize}px;
  background-color: ${({ theme }) => theme.app.backgroundColor};
  color: ${({ theme }) => theme.app.textColor};

  button,
  input {
    outline: none;
    &:focus {
      box-shadow: 0px 0px 0px 2px
        ${({ theme }) => theme.button.activeBackgroundColor};
    }
  }
`
