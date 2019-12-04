import styled from '../../lib/styled'

export default styled.div`
  border-radius: 2px;
  border: solid 1px ${({ theme }: any) => theme.colors.border};
  & > button {
    margin: 0;
    border: 0;
    border-right: 1px solid ${({ theme }: any) => theme.colors.border};
    border-radius: 0;
    &:first-child {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }
    &:last-child {
      border-right: 0;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
`
