import { createGlobalStyle } from 'styled-components'
import { BaseTheme } from '../lib/styled/themes/types'

export const getGlobalCss = (theme: BaseTheme) => `
body {
  margin: 0;
  padding: 10px 15px;
  background-color: ${theme.baseBackgroundColor};
  color: ${theme.emphasizedTextColor};
  font-family: ${theme.fontFamily};
  font-size: ${theme.fontSizes.default}px;
}

* {
  box-sizing: border-box;
  &:focus {outline: none;}
}

input,
select,
button {
  &:focus {
    outline: none;
  }
}

input,
button {
  margin: 0;
  border: 0;
  outline: none;
}

input {
  font-size: ${theme.fontSizes.default}px;
}

/* total width */
::-webkit-scrollbar {
  background-color: transparent;
  width: 12px;
}

/* background of the scrollbar except button or resizer */
::-webkit-scrollbar-track {
  background-color: ${theme.subtleBackgroundColor};
}

/* scrollbar itself */
::-webkit-scrollbar-thumb {
  background-color: ${theme.emphasizedBackgroundColor};
}

/* set button(top and bottom of the scrollbar) */
::-webkit-scrollbar-button {
  display: none
}
`

export default createGlobalStyle<BaseTheme>`
  html {
    width: 100vw;
    min-height: 100vh;
  }

  body {
    margin: 0;
    background-color: ${({ theme }) => theme.baseBackgroundColor};
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: ${({ theme }) => theme.fontSizes.default}px;
  }

  * {
    box-sizing: border-box;
    &:focus {outline: none;}
  }

  input,
  select,
  button {
    &:focus {
      outline: none;
    }
  }

  input,
  button {
    margin: 0;
    border: 0;
    outline: none;
  }

  input {
    font-size: ${({ theme }) => theme.fontSizes.default}px;
  }

  /* total width */
  ::-webkit-scrollbar {
    background-color: transparent;
    width: 12px;
  }

  /* background of the scrollbar except button or resizer */
  ::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.subtleBackgroundColor};
  }

  /* scrollbar itself */
  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
  }

  /* set button(top and bottom of the scrollbar) */
  ::-webkit-scrollbar-button {
    display: none
  }

  .text-center {
    text-align: center;
  }

  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: ${({ theme }) => theme.primaryBackgroundColor};
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
  }
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #29d, 0 0 5px #29d;
    opacity: 1;
    -webkit-transform: rotate(3deg) translate(0px, -4px);
    -ms-transform: rotate(3deg) translate(0px, -4px);
    transform: rotate(3deg) translate(0px, -4px);
  }
  #nprogress .spinner {
    display: none;
    position: fixed;
    z-index: 1031;
    bottom: 15px;
    right: 15px;
  }
  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: solid 2px transparent;
    border-top-color: ${({ theme }) => theme.primaryBackgroundColor};
    border-left-color: ${({ theme }) => theme.primaryBackgroundColor};
    border-radius: 50%;
    -webkit-animation: nprogress-spinner 400ms linear infinite;
    animation: nprogress-spinner 400ms linear infinite;
  }
  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }
  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }
  @-webkit-keyframes nprogress-spinner {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes nprogress-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
