import styled from '../../../lib/styled'
import { topbarIconButtonStyle } from '../../../lib/styled/styleFunctions'

export const rightSideTopBarHeight = 44
export const defaultTopbarIndex = 1

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
