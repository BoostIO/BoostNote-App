import styled from '../styled'

export const BoostnoteIconStyledContainer = styled.div`
  display: inline-block;
  color: currentColor;
  background-color: transparent;
  border: none;

  svg {
    vertical-align: middle;

    &.icon {
      position: absolute;
      top: 5px;
      left: 5px;
      font-size: 20px;
      z-index: 0;
      pointer-events: none;
      color: rgba(255, 255, 255, 0.3);
    }
  }
`
