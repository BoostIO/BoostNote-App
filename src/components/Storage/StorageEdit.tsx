import React, { useCallback, useState } from 'react'
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

  const linkCallback = useCallback(
    (cloudStorage: CloudStorage) => {
      db.setCloudLink(storage.id, cloudStorage)
      // TODO: sync
    },
    [storage, db]
  )

  const unlinkCallback = useCallback(() => {
    db.setCloudLink(storage.id, null)
  }, [storage, db])

  const removeCallback = useCallback(() => {
    db.removeStorage(storage.id)
    router.push('/app')
  }, [storage, db, router])

  useDebounce(
    () => {
      db.renameStorage(storage.id, name)
    },
    1000,
    [name]
  )

  const user = preferences['general.accounts'][0]

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
