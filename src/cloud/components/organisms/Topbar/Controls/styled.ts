import styled from '../../../../lib/styled'
import { baseIconStyle } from '../../../../lib/styled/styleFunctions'

export const StyledContentControls = styled.div`
  display: flex;
  height: 25px;
  margin-right: ${({ theme }) => theme.space.xsmall}px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
  position: relative;
`

export const StyledContentButton = styled.button`
  ${baseIconStyle}
  display: flex;
  align-items: center;
  line-height: 18px;
  background: none;
  border: 0;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
`
