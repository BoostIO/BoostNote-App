import styled from '../../../lib/styled'

export const StyledLogo = styled.div`
  margin-right: ${({ theme }) => theme.space.small}px;
  img {
    height: 30px;
    vertical-align: middle;
  }
`

export const StyledTopbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  z-index: 1;
  width: 100%;
  height: ${({ theme }) => theme.topHeaderHeight}px;
  padding: ${({ theme }) => theme.space.xsmall}px;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  line-height: ${({ theme }) => theme.lineHeights.default};

  &:not(.alignedLeft) {
    right: 0;
  }
`

export const StyledTopbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 75vw;
`
