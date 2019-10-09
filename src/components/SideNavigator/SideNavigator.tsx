import React, { useMemo } from 'react'
import { useRouter } from '../../lib/router'
import SotrageCreateForm from './StorageCreateForm'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import Toolbar from '../atoms/Toolbar'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import { mdiSettings } from '@mdi/js'
import StorageNavigatorItem from './StorageNavigatorItem'

const StyledStorageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow: auto;
`

const StyledSideNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  border-right: solid 1px ${({ theme }) => theme.colors.border};
`

export default () => {
  const {
    createStorage,
    renameStorage,
    removeStorage,
    createFolder,
    removeFolder,
    storageMap
  } = useDb()
  const router = useRouter()

  const storageEntries = useMemo(() => {
    return entries(storageMap)
  }, [storageMap])

  return (
    <StyledSideNavContainer style={{ width: 160 }}>
      <Toolbar>
        <ToolbarSeparator />
        <ToolbarIconButton path={mdiSettings} onClick={() => {}} />
      </Toolbar>
      <StyledStorageList>
        {storageEntries.map(([id, storage]) => {
          return (
            <StorageNavigatorItem
              key={id}
              currentPathname={router.pathname}
              storage={storage}
              renameStorage={renameStorage}
              removeStorage={removeStorage}
              createFolder={createFolder}
              removeFolder={removeFolder}
            />
          )
        })}
      </StyledStorageList>
      {storageEntries.length === 0 && <p>No storages</p>}
      <SotrageCreateForm createStorage={createStorage} />
    </StyledSideNavContainer>
  )
}
