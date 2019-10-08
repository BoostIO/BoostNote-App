import React, { useMemo } from 'react'
import StorageItem from './StorageItem/StorageItem'
import { useRouter } from '../../lib/router'
import SotrageCreateForm from './StorageCreateForm'
import { useDb } from '../../lib/db'
import { entries } from '../../lib/db/utils'
import styled from '../../lib/styled'
import Toolbar from '../atoms/Toolbar'
import ToolbarSeparator from '../atoms/ToolbarSeparator'
import ToolbarIconButton from '../atoms/ToolbarIconButton'
import { mdiSettings } from '@mdi/js'

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
          const pathname = router.pathname
          const active = `/app/storages/${storage.name}` === pathname
          return (
            <StorageItem
              key={id}
              id={id}
              storage={storage}
              removeStorage={removeStorage}
              renameStorage={renameStorage}
              createFolder={createFolder}
              removeFolder={removeFolder}
              pathname={pathname}
              active={active}
            />
          )
        })}
      </StyledStorageList>
      {storageEntries.length === 0 && <p>No storages</p>}
      <SotrageCreateForm createStorage={createStorage} />
    </StyledSideNavContainer>
  )
}
