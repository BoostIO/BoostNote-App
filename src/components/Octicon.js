import React, { PropTypes } from 'react'
import styled, { keyframes } from 'styled-components'
import octicons from 'octicons'

const pulse = keyframes`
  from {
    transform: scale(0.9);
  }

  to {
    transform: scale(1.2);
  }
`
const pulseStyle = `
  animation: ${pulse} 0.5s linear infinite;
`

const Root = styled.svg`
  display: inline-block;
  line-height: 1em;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  ${p => p.pulse ? pulseStyle : ''}
`

class Octicon extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  render () {
    const { icon } = this.props
    const octicon = octicons[icon]
    return (
      <Root
        className='Octicon'
        viewBox={octicon.options.viewBox}
        dangerouslySetInnerHTML={{__html: octicon.path}}
      />
    )
  }
}

Octicon.propTypes = {
  icon: PropTypes.string.isRequired,
  pulse: PropTypes.bool
}

export default Octicon
