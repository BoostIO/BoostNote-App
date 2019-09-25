import styled from '../../lib/styled'

export default styled.div`
  border-radius: 2px;
  border: solid 1px ${({ theme }) => theme.colors.border};
  & > button {
    margin: 0;
    border: 0;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0;
    &:last-child {
      border-right: 0;
    }
  }
`
