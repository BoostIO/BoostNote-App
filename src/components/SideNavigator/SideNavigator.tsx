import React, { useMemo } from 'react'
import StorageItem from './StorageItem/StorageItem'
import { useRouter } from '../../lib/router'
import SotrageCreateForm from './StorageCreateForm'
import { StyledSideNavContainer, StyledStorageList } from './styled'
import { useDb } from '../../lib/db'

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

  const storageEntries = useMemo(
    () => {
      return Object.entries(storageMap)
    },
    [storageMap]
  )

  return (
    <StyledSideNavContainer style={{ width: 160 }}>
      <StyledStorageList>
        {storageEntries.map(([id, storage]) => {
          const pathname = router.pathname
          const active = `/storages/${storage.name}` === pathname
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
