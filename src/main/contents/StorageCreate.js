import React, { PropTypes } from 'react'
import styled from 'styled-components'
import Octicon from 'components/Octicon'

const Root = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

class StorageCreate extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      name: '',
      isSaving: false
    }
  }

  handleNameChange = (e) => {
    this.setState({
      name: e.target.value
    })
  }

  handleConfirmClick = (e) => {
    this.setState({
      isSaving: true
    }, () => {

    })
  }

  render () {
    return (
      <Root>
        <div>Add Storage</div>
        <input
          value={this.state.name}
          onChange={this.handleNameChange}
        />
        <div>
          <button onClick={this.handleConfirmClick}>
            {this.state.isSaving
              ? <span>
                <Octicon icon='pulse' pulse /> Saving...
              </span>
              : <span>
                <Octicon icon='check' /> Confirm
              </span>
            }
          </button>
        </div>

      </Root>
    )
  }
}

StorageCreate.propTypes = {
}

export default StorageCreate
