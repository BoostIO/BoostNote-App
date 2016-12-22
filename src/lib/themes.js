const defaultUIColor = '#333'
const defaultUIInactiveColor = '#999'
const defaultUIInverseColor = '#FFF'
const defaultUIActiveColor = '#5FACFF'
const defaultBorderColor = '#DDD'
const defaultUIBackgroundColor = '#F8F8F8'
const defaultBackgroundColor = '#FFF'

// Button Color
const defaultUIButtonHoverColor = '#EEE'
const defaultUIButtonActiveColor = '#E5E5E5'

const defaultTheme = {
  // Color
  color: defaultUIColor,
  inactiveColor: defaultUIInactiveColor,
  activeColor: defaultUIActiveColor,
  activeInverseColor: defaultUIInverseColor,
  borderColor: defaultBorderColor,
  backgroundColor: defaultBackgroundColor,
  uiBackgroundColor: defaultUIBackgroundColor,
  buttonBackgroundColor: defaultUIBackgroundColor,
  buttonHoverColor: defaultUIButtonHoverColor,
  buttonActiveColor: defaultUIButtonActiveColor,

  border: 'solid 1px ' + defaultBorderColor,
  activeBorderColor: defaultUIActiveColor,
  activeBorder: 'solid 1px ' + defaultUIActiveColor,

  // UI
  input: `
    border: solid 1px ${defaultBorderColor};
    outline: none;
    border-radius: 4px;
    background-color: #FCFCFC;
    color: ${defaultUIColor};
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
    &:hover {
      background-color: ${defaultUIButtonHoverColor};
    }
    &:active {
      background-color: ${defaultUIButtonActiveColor};
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .Octicon {
      fill: ${defaultUIColor};
    }
  `
}

const darkUIColor = '#EEE'
const darkUIInactiveColor = '#999'
const darkUIInverseColor = '#FFF'
const darkUIActiveColor = '#5FACFF'
const darkBorderColor = '#444'
const darkUIBackgroundColor = '#2A2D2E'
const darkBackgroundColor = '#1E1E1E'

// Button Color
const darkUIButtonHoverColor = '#444'
const darkUIButtonActiveColor = '#555'

const darkTheme = {
  // Color
  color: darkUIColor,
  inactiveColor: darkUIInactiveColor,
  activeColor: darkUIActiveColor,
  activeInverseColor: darkUIInverseColor,
  borderColor: darkBorderColor,
  backgroundColor: darkBackgroundColor,
  uiBackgroundColor: darkUIBackgroundColor,
  buttonBackgroundColor: darkUIBackgroundColor,
  buttonHoverColor: darkUIButtonHoverColor,
  buttonActiveColor: darkUIButtonActiveColor,

  border: 'solid 1px ' + darkBorderColor,
  activeBorderColor: darkUIActiveColor,
  activeBorder: 'solid 1px ' + darkUIActiveColor,

  // UI
  input: `
    border: solid 1px ${darkBorderColor};
    outline: none;
    border-radius: 4px;
    background-color: ${darkUIBackgroundColor};
    color: ${darkUIColor};
    &:focus {
      border-color: ${darkUIActiveColor};
    }
  `,
  button: `
    border: solid 1px
    ${darkBorderColor};
    outline: none;
    border-radius: 4px;
    background-color: ${darkUIBackgroundColor};
    color: ${darkUIColor};
    &:hover {
      background-color: ${darkUIButtonHoverColor};
    }
    &:active {
      background-color: ${darkUIButtonActiveColor};
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .Octicon {
      fill: ${darkUIColor};
    }
  `
}

export default {
  default: defaultTheme,
  dark: darkTheme
}
