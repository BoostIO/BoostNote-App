import React, { useState, ChangeEvent, useCallback } from 'react'
import {
  FormGroup,
  FormLabel,
  FormTextInput,
  FormPrimaryButton,
  FormBlockquote
} from '../atoms/form'
import { NoteStorage } from '../../lib/db/types'
import { useDb } from '../../lib/db'
import { renameStorage } from '../../lib/accounts'
import { useFirstUser } from '../../lib/preferences'

interface ManageCloudStorageFormProps {
  storage: NoteStorage
}

const ManageCloudStorageForm = ({ storage }: ManageCloudStorageFormProps) => {
  const [cloudStorageName, setCloudStorageName] = useState(
    storage.cloudStorage!.name || ''
  )
  const [updating, setUpdating] = useState(false)
  const db = useDb()
  const user = useFirstUser()
  const updateCloudStorageName = useCallback(async () => {
    if (storage.cloudStorage == null || user == null) {
      return
    }
    setUpdating(true)

    try {
      await renameStorage(user, storage.cloudStorage.id, cloudStorageName)
      db.renameCloudStorage(storage.id, cloudStorageName)
    } catch (error) {}

    setUpdating(false)
  }, [db, storage.id, storage.cloudStorage, cloudStorageName, user])

  return (
    <>
      <ul>
        <li>
          Cloud storage ID: <strong>{storage.cloudStorage!.id}</strong>
        </li>
        <li>
          Name: <strong>{storage.cloudStorage!.name}</strong>
        </li>
      </ul>
      <FormBlockquote>
        {storage.cloudStorage!.syncedAt != null && (
          <>
            Lastly synced at{' '}
            {new Date(storage.cloudStorage!.syncedAt).toLocaleString()}
          </>
        )}
      </FormBlockquote>
      <FormGroup>
        <FormPrimaryButton>Sync storage</FormPrimaryButton>
      </FormGroup>

      <FormGroup>
        <FormLabel>Cloud storage name</FormLabel>
        <FormTextInput
          type='text'
          value={cloudStorageName}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setCloudStorageName(event.target.value)
          }}
        />
      </FormGroup>
      <FormGroup>
        <FormPrimaryButton onClick={updateCloudStorageName} disabled={updating}>
          {updating ? 'Updating...' : 'Update cloud storage name'}
        </FormPrimaryButton>
      </FormGroup>
    </>
  )
}

export default ManageCloudStorageForm
