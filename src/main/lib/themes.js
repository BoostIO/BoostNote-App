const defaultUIColor = '#333'
const defaultUIInactiveColor = '#999'
const defaultUIInverseColor = '#FFF'
const defaultUIActiveColor = '#5FACFF'
const defaultBorderColor = '#DDD'
const defaultUIBackgroundColor = '#F8F8F8'
const defaultUIFontSize = '12px'
const defaultUIFontFamily = 'Helvetica, Arial, sans-serif'
const defaultBackgroundColor = '#FFF'

// Button Color
const defaultUIButtonHoverColor = '#F4F4F4'
const defaultUIButtonActiveColor = '#EEE'

const defaultTheme = {
  // Color
  color: defaultUIColor,
  inactiveColor: defaultUIInactiveColor,
  inverseColor: defaultUIInverseColor,
  activeColor: defaultUIActiveColor,
  borderColor: defaultBorderColor,
  backgroundColor: defaultBackgroundColor,
  navBackgroundColor: defaultUIBackgroundColor,
  titleBarBackgroundColor: defaultUIBackgroundColor,

  buttonHoverColor: defaultUIButtonHoverColor,
  buttonActiveColor: defaultUIButtonActiveColor,
  border: 'solid 1px ' + defaultBorderColor,
  activeBorderColor: defaultUIActiveColor,
  activeBorder: 'solid 1px ' + defaultUIActiveColor,

  // Typo
  fontSize: defaultUIFontSize,
  fontFamily: defaultUIFontFamily,

  // UI
  input: `
    border: solid 1px
    ${defaultBorderColor};
    outline: none;
    border-radius: 4px;
    background-color: #FCFCFC;
    color: ${defaultUIColor};
    font-size: ${defaultUIFontSize};
    font-family: ${defaultUIFontFamily};
    &:focus {
      border-color: ${defaultUIActiveColor};
    }
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
  `
}

export default {
  default: defaultTheme
}
