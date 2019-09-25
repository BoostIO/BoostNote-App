import styled from '../../lib/styled'

const Toolbar = styled.div`
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export default Toolbar
