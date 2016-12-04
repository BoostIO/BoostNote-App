import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Octicon } from 'components'
import StorageSection from './StorageSection'
import { isFinallyBlurred } from 'lib/util'
import commander from 'main/lib/commander'

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  &:focus {
    outline: none;
  }
`

const StorageList = styled.div`
  width: 100%;
  overflow-y: auto;
  flex: 1;
`

const BottomButton = styled.button`
  display: block;
  width: 100%;
  height: 30px;
  line-height: 30px;
  margin: 0;
  padding: 0 10px;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  color: ${p => p.theme.color};
  text-decoration: none;
  text-align: left;
  font-size: ${p => p.theme.fontSize};
  font-family: ${p => p.theme.fontFamily};
  &:hover {
    background-color: ${p => p.theme.buttonHoverColor};
  }
  &:active {
    background-color: ${p => p.theme.buttonActiveColor};
  }
`

class Nav extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isFocused: false
    }

    this.handleNewFolderClick = e => {
      this.refs['storage-' + this.context.router.params.storageName].createNewFolder()
    }
  }

  componentDidMount () {
    window.addEventListener('core:delete', this.handleCoreDelete)
  }

  componentWillUnmount () {
    window.removeEventListener('core:delete', this.handleCoreDelete)
  }

  handleFocus = e => {
    if (!this.state.isFocused) {
      this.setState({
        isFocused: true
      })
    }
  }

  handleBlur = e => {
    if (isFinallyBlurred(e, this.root)) {
      this.setState({
        isFocused: false
      })
    }
  }

  handleCoreDelete = e => {
    if (this.state.isFocused) {
      const { router } = this.context
      const { storageName, folderName } = router.params

      if (folderName != null) {
        commander.deleteFolder(storageName, folderName)
      }
    }
  }

  render () {
    const { storageMap } = this.props

    const storageList = storageMap
      .map((storageData, storageName) => {
        return <StorageSection
          ref={'storage-' + storageName}
          key={storageName}
          storageName={storageName}
          storageData={storageData}
          isFocused={this.state.isFocused}
        />
      })
      .toArray()

    return (
      <Root style={{width: this.props.width}}
        innerRef={c => (this.root = c)}
        tabIndex='0'
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      >
        <StorageList>
          {storageList}
        </StorageList>
        <BottomButton onClick={this.handleNewFolderClick}
          title='Create a folder'
        >
          <Octicon icon='plus' /> Add Folder
        </BottomButton>
      </Root>
    )
  }
}

Nav.propTypes = {
}

Nav.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func,
    isActive: PropTypes.func,
    params: PropTypes.object
  })
}

export default Nav
