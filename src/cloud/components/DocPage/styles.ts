import { rightSideTopBarHeight } from '../../../design/components/organisms/Topbar'
import styled from '../../../design/lib/styled'
import { rightSidePageLayout } from '../../../design/lib/styled/styleFunctions'

export const StyledDocPage = styled.div`
  ${rightSidePageLayout}
  margin: 0 auto;
  padding-top: calc(
    ${rightSideTopBarHeight}px + ${({ theme }) => theme.sizes.spaces.l}px
  );
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  padding-right: ${({ theme }) => theme.sizes.spaces.l}px;
  min-height: calc(100vh - ${rightSideTopBarHeight}px);
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const StyledDocPageButtons = styled.div`
  display: flex;
  align-items: center;
`
