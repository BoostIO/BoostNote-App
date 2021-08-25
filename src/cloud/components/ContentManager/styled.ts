import { rightSideTopBarHeight } from '../../../design/components/organisms/Topbar'
import styled from '../../../design/lib/styled'

export const StyledContentManager = styled.div`
  display: block;
  width: 100%;
`

export const StyledContentManagerList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - ${rightSideTopBarHeight}px);
`
