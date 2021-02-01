import styled from '../../../lib/styled'
import { rightSidePageLayout } from '../../../lib/styled/styleFunctions'
import { rightSideTopBarHeight } from '../RightSideTopBar/styled'

export const StyledDocPage = styled.div`
  ${rightSidePageLayout}
  margin: 0 auto;
  padding-top: calc(
    ${rightSideTopBarHeight}px + ${({ theme }) => theme.space.large}px
  );
  padding-left: ${({ theme }) => theme.space.large}px;
  padding-right: ${({ theme }) => theme.space.large}px;
  min-height: calc(100vh - ${rightSideTopBarHeight}px);
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const StyledDocPageSearch = styled.div`
  padding-bottom: ${({ theme }) => theme.space.small}px;
`

export const StyledDocPageButtons = styled.div`
  display: flex;
  align-items: center;
`
