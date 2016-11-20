import React, { PropTypes } from 'react'
import styled, { keyframes } from 'styled-components'
import _ from 'lodash'
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

const Icon = styled.svg`
  display: inline-block;
  line-height: 1em;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: ${p => _.isString(p.color) ? p.color : 'inherit'};
  ${p => p.pulse ? pulseStyle : ''}
`

class Octicon extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  render () {
    const { size, icon } = this.props
    const octicon = octicons[icon]
    return (
      <Icon
        {...this.props}
        width={size}
        height={size}
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
