import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Octicon } from 'components'
import StorageSection from './StorageSection'

const Root = styled.div`
  position: relative;
  min-width: 150px;
  overflow: hidden;
`

const StorageList = styled.div`
  position: absolute;
  top: 0;
  bottom: 30px;
  left: 0;
  right: 0;
  width: 100%;
  overflow-y: auto;
`

const BottomButton = styled.button`
  ${p => p.theme.navButton}
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  width: 100%;
  line-height: 30px;
  padding: 0 10px;
  cursor: pointer;
`

class Nav extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }

    this.handleNewFolderClick = e => {
      this.refs['storage-' + this.context.router.params.storageName].createNewFolder()
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
        />
      })
      .toArray()

    return (
      <Root style={{width: this.props.width}}>
        <StorageList>
          {storageList}
        </StorageList>
        <BottomButton onClick={this.handleNewFolderClick}>
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
