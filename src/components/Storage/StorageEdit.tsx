import React, { useCallback, useState, useEffect } from 'react'
import { Section, SectionHeader } from '../PreferencesModal/styled'
import CloudStorageSelector from './CloudStorageSelector'
import { usePreferences } from '../../lib/preferences'
import { useDb } from '../../lib/db'
import { CloudStorage } from '../../lib/accounts'
import { NoteStorage } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useDebounce } from 'react-use'
import LoginButton from '../atoms/LoginButton'

interface StorageEditProps {
  storage: NoteStorage
}

export default ({ storage }: StorageEditProps) => {
  const db = useDb()
  const router = useRouter()
  const { preferences } = usePreferences()
  const [name, setName] = useState(storage.name)

  useEffect(() => {
    setName(storage.name)
  }, [storage])

  const user = preferences['general.accounts'][0]

  const linkCallback = useCallback(
    (cloudStorage: CloudStorage) => {
      db.setCloudLink(storage.id, cloudStorage, user).catch(() => {
        //TODO: toast syncing failed
        console.log('sync error')
      })
    },
    [storage.id, db, user]
  )

  const unlinkCallback = useCallback(() => {
    db.removeCloudLink(storage.id)
  }, [storage.id, db])

  const removeCallback = useCallback(() => {
    db.removeStorage(storage.id)
    router.push('/app')
  }, [storage.id, db, router])

  useDebounce(
    () => {
      db.renameStorage(storage.id, name)
    },
    1000,
    [name]
  )

  return (
    <div>
      <Section>
        <SectionHeader>Edit Storage</SectionHeader>
        <div>
          <label>
            Storage Name{' '}
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              type='text'
            />
          </label>
          <span onClick={removeCallback}>Delete Storage</span>
        </div>
        <div>
          <h2>Cloud Storage</h2>
          {storage.cloudStorage != null ? (
            <p>
              Linked Storage: {storage.cloudStorage.name} (ID:
              {storage.cloudStorage.id}){' '}
              <span onClick={unlinkCallback}>Unlink</span>
            </p>
          ) : (
            <div>
              {user == null && (
                <>
                  <p>You need to sign in to add a cloud folder</p>
                  <LoginButton />
                </>
              )}
              {user != null && (
                <>
                  <p>This storage is not linked yet</p>
                  <CloudStorageSelector
                    user={user}
                    onSelect={linkCallback}
                    name={storage.name}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
