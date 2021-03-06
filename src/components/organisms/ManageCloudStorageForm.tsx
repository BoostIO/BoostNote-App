import React, { useCallback, useMemo } from 'react'
import {
  FormGroup,
  FormPrimaryButton,
  FormBlockquote,
  FormSecondaryButton,
  FormHeading,
} from '../atoms/form'
import { PouchNoteStorage } from '../../lib/db/types'
import { useDb } from '../../lib/db'
import { useFirstUser } from '../../lib/preferences'
import { useToast } from '../../lib/toast'
import Spinner from '../atoms/Spinner'
import LoginButton from '../atoms/LoginButton'
import { SectionPrimaryButton } from '../PreferencesModal/styled'
import { openNew } from '../../lib/platform'

interface ManageCloudStorageFormProps {
  storage: PouchNoteStorage
}

const ManageCloudStorageForm = ({ storage }: ManageCloudStorageFormProps) => {
  const db = useDb()
  const user = useFirstUser()

  const { pushMessage } = useToast()

  const syncStorage = useCallback(() => {
    db.syncStorage(storage.id)
  }, [storage.id, db])

  const stopSyncing = () => {
    storage.sync!.cancel()
  }

  const syncing = useMemo(() => {
    return storage.sync != null
  }, [storage.sync])

  if (user == null) {
    return (
      <>
        <FormBlockquote>
          Sign in to manage the legacy cloud space
        </FormBlockquote>
        <LoginButton
          onErr={() => {
            pushMessage({
              title: 'Cloud Error',
              description:
                'An error occured while attempting to create a legacy cloud space',
            })
          }}
          ButtonComponent={FormPrimaryButton}
        />
      </>
    )
  }

  return (
    <>
      {syncing ? (
        <FormBlockquote>
          <Spinner /> Syncing...
        </FormBlockquote>
      ) : (
        storage.cloudStorage!.syncedAt != null && (
          <FormBlockquote>
            Lastly synced at{' '}
            {new Date(storage.cloudStorage!.syncedAt).toLocaleString()}
          </FormBlockquote>
        )
      )}
      <FormGroup>
        {syncing ? (
          <FormSecondaryButton onClick={stopSyncing}>
            Stop syncing
          </FormSecondaryButton>
        ) : (
          <FormPrimaryButton onClick={syncStorage}>
            Sync Storage
          </FormPrimaryButton>
        )}
      </FormGroup>

      <FormHeading depth={3}>Billing(Legacy Cloud)</FormHeading>
      <FormBlockquote>
        All existing legacy cloud subscriptions will be automatically cancelled
        from 31th March.
      </FormBlockquote>
      <FormGroup>
        <SectionPrimaryButton
          onClick={() => openNew('https://note.boostio.co/subscription')}
        >
          Manage
        </SectionPrimaryButton>
      </FormGroup>
    </>
  )
}

export default ManageCloudStorageForm
