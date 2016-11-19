const defaultUIColor = '#333'
const defaultUIActiveColor = '#4F9DFB'
const defaultBorderColor = '#DEDCDE'
const defaultUIFontSize = '12px'
const defaultUIFontFamily = 'Helvetica, Arial, sans-serif'

const defaultTheme = {
  borderColor: defaultBorderColor,
  border: 'solid 1px ' + defaultBorderColor,
  activeBorderColor: defaultUIActiveColor,
  activeBorder: 'solid 1px ' + defaultUIActiveColor,
  input: `
    border: solid 1px
    ${defaultBorderColor};
    outline: none;
    border-radius: 4px;
    background-color: #FCFCFC;
    color: ${defaultUIColor};
    font-size: ${defaultUIFontSize};
    font-family: ${defaultUIFontFamily};
  `,
  button: `
    border: solid 1px
    ${defaultBorderColor};
    outline: none;
    border-radius: 4px;
    background-color: #FCFCFC;
    color: ${defaultUIColor};
    font-size: ${defaultUIFontSize};
    font-family: ${defaultUIFontFamily};
    &:active {
      background-color: #DCDCDC;
    }
  `,
  navButton: `
    display: block;
    outline: none;
    border: none;
    background-color: transparent;
    text-align: left;
    color: ${defaultUIColor};
    text-decoration: none;
    font-size: ${defaultUIFontSize};
    font-family: ${defaultUIFontFamily};
    &:hover {
      background-color: #EEE;
    }
    &:active {
      background-color: #DCDCDC;
    }
    &.active {
      background-color: ${defaultUIActiveColor};
      color: white;
    }
  `
}

export default {
  default: defaultTheme
}
