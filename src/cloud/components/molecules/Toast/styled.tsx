import styled from '../../../lib/styled'

export const StyledToastContainer = styled.div`
  position: relative;
  width: 350px;
  margin: ${({ theme }) => theme.space.large}px;
  padding: ${({ theme }) => theme.space.small}px
    ${({ theme }) => theme.space.default}px
    ${({ theme }) => theme.space.small}px ${({ theme }) => theme.space.small}px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  background-color: ${({ theme }) => theme.secondaryBackgroundColor};
  color: ${({ theme }) => theme.whiteTextColor};

  &.toast-error {
    background-color: ${({ theme }) => theme.dangerBackgroundColor};
  }

  &.toast-success {
    background-color: ${({ theme }) => theme.successBackgroundColor};
  }

  &.toast-info {
    background-color: ${({ theme }) => theme.infoBackgroundColor};
  }
`

export const StyledToastCloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.whiteTextColor};
  opacity: 0.7;
  transition: 0.2s;

  &:hover,
  &:focus {
    opacity: 1;
  }
`

export const StyledToastDescription = styled.p`
  margin-bottom: 0;
  font-size: ${({ theme }) => theme.fontSizes.default}px;
`
