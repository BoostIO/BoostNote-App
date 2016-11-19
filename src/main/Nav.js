import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { Octicon, LinkButton } from 'components'
import { Map } from 'immutable'

const Root = styled.div`
  position: relative;
  min-width: 150px;
  width: ${(p) => p.width}px;
  overflow: hidden;
`

const StorageSection = styled.div`
  margin: 10px 0;
`

const NavButton = styled(LinkButton)`
  ${(p) => p.active ? p.theme.navButtonActive : p.theme.navButton}
  display: block;
  height: 24px;
  line-height: 24px;
  margin: 0;
  padding: 0 10px;
  cursor: pointer;
  width: 100%;
`

const FolderButton = styled(NavButton)`
  padding: 0 20px;
`

const BottomButton = styled.button`
  ${(p) => p.theme.navButton}
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
  }

  render () {
    const { storageMap } = this.props
    const { router } = this.context

    const storageList = storageMap
      .map((data, storageName) => {
        const folderList = data.folders
          .map((meta, folderName) => {
            const folderPath = `/storages/${storageName}/folders/${folderName}`

            return <FolderButton
              key={folderName}
              to={folderPath}
              active={router.isActive(folderPath)}
            >
              {folderName}
            </FolderButton>
          })
          .toArray()
        const storagePath = `/storages/${storageName}/all-notes`
        const isStorageActive = router.isActive(storagePath)
        return <StorageSection
          key={storageName}
          >
          <NavButton
            to={storagePath}
            active={isStorageActive}
          >
            <Octicon icon='repo' size={12} color={isStorageActive && 'white'} /> {storageName}
          </NavButton>
          {folderList}
        </StorageSection>
      })
      .toArray()

    return (
      <Root width={this.props.width}>
        {storageList}
        <BottomButton>
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
    isActive: PropTypes.func
  })
}

export default Nav
