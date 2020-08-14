import styled from '../../lib/styled'
import { secondaryBackgroundColor } from '../../lib/styled/styleFunctions'

export const StyledToastContainer = styled.div`
  width: 350px;
  margin: 40px;
  padding: 10px 30px;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  ${secondaryBackgroundColor}
`
export const StyledToastTop = styled.div`
  display: inline-flex;
  border-bottom: 1px solid;
  width: 100%;
`
export const StyledToastRight = styled.div`
  position: absolute;
  right: 60px;
  display: inline-flex;
`
export const StyledToastTitle = styled.p`
  font-size: 16px;
  font-weight: 600;
`

export const StyledToastTime = styled.p`
  font-size: 12px;
  margin-right: 10px;
  line-height: 25px;
`

export const StyledToastCloseButton = styled.button`
  background-color: transparent;
  font-size: 24px;
  order: none;
  cursor: pointer;
  border: none;
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  .active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }
`

export const StyledToastDescription = styled.p`
  font-size: 14px;
`
