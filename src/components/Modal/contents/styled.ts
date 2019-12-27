import styled from '../../../lib/styled'
import { textColor } from '../../../lib/styled/styleFunctions'

export const ModalContainer = styled.div`
  width: 100%;
  ${textColor}
  padding: 3px;
`

export const ModalHeader = styled.h1`
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
`

export const ModalSubtitle = styled.h4`
  text-align: center;
  margin-bottom: 8vh;
`

export const ModalBody = styled.div`
  margin-top: 20px;
  padding: 0 2%;

  .button {
    display: block;
    background-color: rgb(3, 197, 136);
    font-size: 16px;
    line-height: 1;
    text-transform: uppercase;
    color: rgb(255, 255, 255);
    padding: 16px 32px !important;
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    border-radius: 2px;
    margin: auto !important;
    margin-bottom: 10px;
    height: auto !important;

    &:not(:disabled):hover {
      cursor: pointer;
      opacity: 0.8;
    }

    &.darker {
      background-color: #d7d7d7;
      color: #000;
    }

    .subtext {
      font-size: 12px;
    }
  }
`

export const ModalFlex = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: no-wrap;
  justify-content: space-between;
  align-items: top;

  div {
    flex: 1 1 0;
  }

  img {
    max-width: 100%;
    width: auto;
    height: 30vh;
    display: block;
    margin: auto;
  }

  .center {
    text-align: center;
  }
`
