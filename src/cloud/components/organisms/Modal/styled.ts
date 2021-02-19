import styled from '../../../lib/styled'
import { baseIconStyle } from '../../../lib/styled/styleFunctions'

const zIndexModals = 8001

export const StyledModals = styled.div`
  z-index: ${zIndexModals};
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`

export const StyledModalsBackground = styled.div`
  z-index: ${zIndexModals + 1};
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.blackBackgroundColor};
  opacity: 0.7;
`

export const StyledModalsContainer = styled.div`
  z-index: ${zIndexModals + 2};
  display: flex;
  position: relative;
  width: 96%;
  max-width: 900px;
  max-height: 60vh;
  background-color: ${({ theme }) => theme.baseBackgroundColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  border-radius: 4px;
  overflow: auto;

  &.fit-content {
    height: fit-content;
    width: fit-content;
    min-width: 400px;
  }

  &.small {
    max-height: 35vh;
  }

  &.large {
    max-height: 80vh;
  }

  &.fixed-height-large {
    max-height: 80vh;
    height: 80vh;
  }

  &.largeW {
    max-width: 1100px;
    max-height: 80vh;
  }

  &.smallW {
    max-width: 400px;
  }

  &.size-XL {
    max-width: 1400px;
    max-height: 92vh;
    height: 92vh;
  }

  &.fullscreen {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }
`

export const StyledSideNavModal = styled.div`
  background-color: ${({ theme }) => theme.sideNavBackgroundColor};
  overflow: auto;
`

export const StyledModalsHeader = styled.h1`
  margin: 0;
  padding: ${({ theme }) => theme.space.xsmall}px 0;
`

export const StyledModalsCloseButton = styled.button`
  ${baseIconStyle}
  position: absolute;
  top: ${({ theme }) => theme.space.small}px;
  right: ${({ theme }) => theme.space.small}px;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
  white-space: nowrap;
  z-index: 1;

  span,
  svg {
    line-height: 20px;
    vertical-align: sub;
  }
`
