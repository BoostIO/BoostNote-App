import styled from '../../../lib/styled'
import { topbarIconButtonStyle } from '../../../lib/styled/styleFunctions'

export const rightSideTopBarHeight = 44
export const defaultTopbarIndex = 1
export const StyledRightSideTopbar = styled.div`
  display: flex;
  width: 100%;
  height: ${rightSideTopBarHeight}px;
  background: ${({ theme }) => theme.baseBackgroundColor};
  border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
  position: fixed;
  top: 0;
  align-items: center;
  justify-content: space-between;
  z-index: ${defaultTopbarIndex};
  min-width: 0;
  font-size: ${({ theme }) => theme.fontSizes.small}px !important;
  flex: 0 0 auto;
`

export const StyledTopbarLeft = styled.div`
  display: flex;
  flex: 2 2 auto;
  align-items: center;
  min-width: 0;
  height: 100%;
  margin-left: ${({ theme }) => theme.space.xxsmall}px;
`

export const StyledTopbarRight = styled.div`
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
  align-items: center;
  min-width: 0;
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
`

export const StyledTopBarInlineFlex = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.space.xxsmall}px;
  margin-right: ${({ theme }) => theme.space.xxsmall}px;
  min-width: 0;
  height: 100%;
  flex-grow: 1;
`

export const StyledNavButtonSpacer = styled.div`
  background: none;
  flex: 0 0 auto;
  height: ${rightSideTopBarHeight}px;
  width: ${rightSideTopBarHeight}px;
  min-width: 0;
`

export const StyledNavHideButton = styled.button`
  ${topbarIconButtonStyle}
  position: absolute;
  top: 7px;
  left: -15px;
  flex: 0 0 auto;
  min-width: 0;
  opacity: 0;
  background-color: ${({ theme }) => theme.subtleBackgroundColor};

  &:hover,
  &:focus {
    opacity: 1;
  }
`

export const StyledTopBarIcon = styled.button`
  ${topbarIconButtonStyle}
`
export const StyledTopbarVerticalSplit = styled.div`
  width: 1px;
  background: ${({ theme }) => theme.subtleBorderColor};
  height: ${rightSideTopBarHeight - 10}px;
  margin-left: ${({ theme }) => theme.space.default}px;
  margin-right: ${({ theme }) => theme.space.default}px;
  flex: 0 0 auto;

  &.transparent {
    background: none;
    margin-left: ${({ theme }) => theme.space.xsmall}px;
    margin-right: ${({ theme }) => theme.space.xsmall}px;
  }
`
