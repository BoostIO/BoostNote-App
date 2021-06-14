import styled from '../../../lib/styled'

export const StyledContentManager = styled.div`
  display: block;
  width: 100%;
`

export const StyledContentManagerList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - ${({ theme }) => theme.topHeaderHeight}px);
`

export const StyledRowActionIcon = styled.button`
  padding: 0;
  margin: 0 ${({ theme }) => theme.space.xxsmall}px;
  display: inline-block;
  background: none;
  outline: 0;
  border: 0;
  color: ${({ theme }) => theme.baseTextColor};
  width: 25px;

  .icon {
    color: inherit !important;
  }

  &:hover {
    color: ${({ theme }) => theme.emphasizedTextColor};
  }

  &:disabled {
    color: ${({ theme }) => theme.secondaryTextColor};
    cursor: not-allowed;
  }

  &.valign-super {
    vertical-align: middle;
  }
`
