import styled from '../../lib/styled'
import { StyledProps } from '../../lib/styled/styleFunctions'

const Card = styled.div`
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${({ theme }: StyledProps) => theme.space.xxlarge}px
    ${({ theme }) => theme.space.large}px;
  background: ${({ theme }: StyledProps) => theme.secondaryBackgroundColor};
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  text-align: center;

  p {
    color: ${({ theme }) => theme.baseTextColor};
  }
`

export default Card
