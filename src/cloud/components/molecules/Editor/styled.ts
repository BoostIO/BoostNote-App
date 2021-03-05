import styled from '../../../lib/styled'

export const StyledEditorToolButtonContainer = styled.div`
  margin: 0 5px;
  position: relative;

  &.editor-tool-integrations {
    margin-right: ${({ theme }) => theme.space.default}px;

    .top {
      transform: translateX(-10%);
    }

    button {
      &:hover,
      &:focus {
        color: ${({ theme }) => theme.primaryTextColor};
      }
    }
  }

  &.tour-component {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    box-shadow: 0px 4px 0px 12px ${({ theme }) => theme.baseBackgroundColor};
    background: ${({ theme }) => theme.baseBackgroundColor};
  }

  &.scroll-sync .bottom {
    left: 100%;
    transform: translateX(-20%);
  }
`

export const StyledEditorToolButton = styled.button`
  display: flex;
  background: none;
  color: ${({ theme }) => theme.subtleTextColor};
  padding: ${({ theme }) => theme.space.xxsmall}px 0;
  font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.emphasizedTextColor};
  }
`

export const StyledEditorToolList = styled.div`
  display: flex;
  height: 100%;
`

export const StyledEditorToolDropdownContainer = styled.div`
  z-index: 9000;
  position: absolute;
  padding: ${({ theme }) => theme.space.xsmall}px 0;
  width: auto;
  height: auto;
  min-width: 100%;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  border: none;
  left: 0;
  top: 100%;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
`
