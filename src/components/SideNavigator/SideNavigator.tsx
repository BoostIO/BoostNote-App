import React, { useMemo, useCallback } from 'react'
import StorageItem from './StorageItem/StorageItem'
import { useRouter } from '../../lib/router'
import SotrageCreateForm from './StorageCreateForm'
import { StyledSideNavContainer, StyledStorageList } from './styled'
import { useDb } from '../../lib/db'

export default () => {
  const db = useDb()
  const router = useRouter()

  const storageEntries = useMemo(
    () => {
      return Object.entries(db.storageMap)
    },
    [db.storageMap]
  )

  const createStorage = useCallback(
    async (storageName: string) => {
      await db.createStorage(storageName)
    },
    [db.createStorage]
  )

  const renameStorage = useCallback(
    async (storageId: string, name: string) => {
      await db.renameStorage(storageId, name)
    },
    [db.renameStorage]
  )

  const removeStorage = useCallback(
    async (storageId: string) => {
      await db.removeStorage(storageId)
    },
    [db.removeStorage]
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
              createFolder={async () => {}}
              removeFolder={async () => {}}
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
