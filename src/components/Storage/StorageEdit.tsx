import React, { useCallback, useState, useEffect } from 'react'
import {
  SectionMargin,
  SectionHeader1,
  RightMargin,
  SectionPrimaryButton,
  DeleteStorageButton
} from '../PreferencesModal/styled'
import CloudStorageSelector from './CloudStorageSelector'
import { usePreferences } from '../../lib/preferences'
import { useDb } from '../../lib/db'
import { CloudStorage } from '../../lib/accounts'
import { NoteStorage } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useDebounce } from 'react-use'
import LoginButton from '../atoms/LoginButton'
import { useDialog, DialogIconTypes } from '../../lib/dialog'

interface StorageEditProps {
  storage: NoteStorage
}

export default ({ storage }: StorageEditProps) => {
  const db = useDb()
  const router = useRouter()
  const { preferences } = usePreferences()
  const [name, setName] = useState(storage.name)
  const { messageBox } = useDialog()

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
    messageBox({
      title: `Remove "${storage.name}" storage`,
      message: 'The storage will be unlinked from this app.',
      iconType: DialogIconTypes.Warning,
      buttons: ['Remove Storage', 'Cancel'],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: (value: number | null) => {
        if (value === 0) {
          db.removeStorage(storage.id)
          router.push('/app')
        }
      }
    })
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
      <SectionMargin>
        <SectionHeader1>Edit Storage</SectionHeader1>
        <div>
          <RightMargin>
            <label>
              <RightMargin>Storage Name</RightMargin>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
              />
            </label>
          </RightMargin>
          <DeleteStorageButton onClick={removeCallback}>
            Delete Storage
          </DeleteStorageButton>
        </div>
        <div>
          <h2>Cloud Storage</h2>
          {storage.cloudStorage != null ? (
            <div>
              <p>
                Linked Storage: {storage.cloudStorage.name} (ID:
                {storage.cloudStorage.id})
                <span onClick={unlinkCallback}>Unlink</span>
              </p>
              <p>
                Last synced at
                {new Date(storage.cloudStorage.updatedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div>
              {user == null && (
                <>
                  <p>You need to sign in to add a cloud storage.</p>
                  <LoginButton
                    onErr={console.error /* TODO: Toast error */}
                    ButtonComponent={SectionPrimaryButton}
                  />
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
      </SectionMargin>
    </div>
  )
}
