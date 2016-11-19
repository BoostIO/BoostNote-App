import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { LinkButton } from 'components'

const Button = styled(LinkButton)`
  ${(p) => p.theme.navButton}
  display: block;
  height: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0 10px;
  cursor: pointer;
  width: 100%;
`

const RenameInput = styled.input`
  ${(p) => p.theme.input}
`

class FolderButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isRenaming: false
    }

    this.handleContextMenu = (e) => {
    }
  }

  rename () {
    this.setState({
      isRenaming: true
    }, () => {
      console.log(this.input)
      this.input.focus()
    })
  }

  render () {
    const { folderPath, folderName } = this.props

    return (
      <div>
        {this.state.isRenaming
          ? <RenameInput />
          : <Button
            to={folderPath}
            onContextMenu={this.handleContextMenu}
          >
            {folderName}
          </Button>
        }
      </div>
    )
  }
}

FolderButton.propTypes = {
  folderPath: PropTypes.string,
  folderName: PropTypes.string
}

export default FolderButton
