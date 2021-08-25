import styled from '../../../design/lib/styled'

export const StyledEditorToolButtonContainer = styled.div`
  margin: 0 5px;
  position: relative;

  &.editor-tool-integrations {
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;

    .top {
      transform: translateX(-10%);
    }

    button {
      &:hover,
      &:focus {
        color: ${({ theme }) => theme.colors.text.link};
      }
    }
  }

  &.scroll-sync .bottom {
    left: 100%;
    transform: translateX(-20%);
  }
`

export const StyledEditorToolButton = styled.button`
  display: flex;
  background: none;
  color: ${({ theme }) => theme.colors.text.subtle};
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
  font-size: ${({ theme }) => theme.sizes.fonts.xl}px;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export const StyledEditorToolList = styled.div`
  display: flex;
  height: 100%;
`

export const StyledEditorToolDropdownContainer = styled.div`
  z-index: 9000;
  position: absolute;
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
  width: 110px;
  height: auto;
  min-width: 100%;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  border: none;
  left: 0;
  bottom: 100%;
  background-color: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.colors.shadow};
`
