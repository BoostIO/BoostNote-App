import React, { PropTypes } from 'react'
import styled from 'styled-components'
import Octicon from 'components/Octicon'

const Root = styled.div`
  background-color: ${p => p.theme.backgroundColor};
  color: ${p => p.theme.color};
`

class KeybindingsTab extends React.Component {
  render () {
    return <Root>

    </Root>
  }
}

KeybindingsTab.propTypes = {
}

export default KeybindingsTab
