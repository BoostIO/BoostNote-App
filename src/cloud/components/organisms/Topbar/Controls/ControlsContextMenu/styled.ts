import styled from '../../../../../lib/styled'

export const zIndexModalsBackground = 8002

export const StyledContextMenuBackground = styled.div`
  z-index: ${zIndexModalsBackground};
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 0;
  position: fixed;
  width: 100vw;
  height: 100vh;
`

export const StyledContextMenuContainer = styled.div`
  z-index: ${zIndexModalsBackground + 1};
  position: absolute;
  top: ${({ theme }) => theme.space.medium}px;
  right: ${({ theme }) => theme.space.small}px;
  margin: auto;
  padding: ${({ theme }) => theme.space.xsmall}px 0;
  width: 350px;
  height: auto;
  min-width: 170px;
  max-height: 70vh;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  border: none;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  font-size: 13px;

  &.large {
    width: 500px;
  }

  &.left {
    left: 0;
    right: initial;
    width: fit-content;
  }
`

export const Scrollable = styled.div`
  flex: 1 1 auto;
  width: 100%;
  overflow: hidden auto;
`

export const StyledFooter = styled.div`
  margin-top: ${({ theme }) => theme.space.xsmall}px;
  padding: ${({ theme }) => theme.space.xsmall}px
    ${({ theme }) => theme.space.small}px;
  border-top: 1px solid ${({ theme }) => theme.baseBorderColor};

  div {
    margin-top: ${({ theme }) => theme.space.xxsmall}px;
  }
`

export const StyledMenuItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;

  &.space-between {
    justify-content: space-between;
  }
`

export const StyledMenuItemBadge = styled.div`
  background: ${({ theme }) => theme.primaryBackgroundColor};
  text-transform: uppercase;
  color: ${({ theme }) => theme.whiteTextColor};
  flex: 0 0 auto;
  padding: 3px 5px;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
`

export const StyledIcon = styled.div`
  padding-right: ${({ theme }) => theme.space.small}px;
  font-size: 21px;
`

export const StyledContextMenuRow = styled.div`
  position: relative;
  font-size: 13px;
  padding: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.small}px;

  height: fit-content;
  border-bottom: 2px solid ${({ theme }) => theme.subtleBorderColor};
`

export const StyledContextHorizontalLine = styled.div`
  height: 2px;
  width: 100%;
  background: ${({ theme }) => theme.subtleBorderColor};
`

export const StyledLinkList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`
