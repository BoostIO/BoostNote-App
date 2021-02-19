import styled from '../../../lib/styled'

export const StyledFixedBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9998;
`

export const StyledRelativeDialog = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 65vh;
  position: relative;
  left: ${({ theme }) => theme.space.default}px;
  bottom: ${({ theme }) => theme.space.xxsmall}px;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  border: 1px solid ${({ theme }) => theme.baseBorderColor};
  font-size: ${({ theme }) => theme.fontSizes.small}px;
  box-sizing: border-box;
  border-radius: 4px;
  outline: none;
  border-radius: 3px;
  position: relative;
  max-width: calc(100vw - 24px);
  z-index: 9999;
  box-shadow: ${({ theme }) => theme.baseShadowColor};
`

export const StyledWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 9997;
`
export const StyledRelativeWrapper = styled.div`
  position: relative;
  top: 100%;
  pointer-events: auto;
  width: 100%;
`
