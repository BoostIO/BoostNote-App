import React, {
  useState,
  ChangeEvent,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import {
  FormGroup,
  FormLabel,
  FormTextInput,
  FormPrimaryButton,
  FormBlockquote,
  FormSecondaryButton,
  FormHeading,
} from '../../../components/atoms/form'
import { PouchNoteStorage } from '../../../lib/db/types'
import { useDb } from '../../lib/db'
import { renameStorage, deleteStorage } from '../../../lib/accounts'
import { useFirstUser } from '../../../lib/preferences'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../../lib/toast'
import Spinner from '../../../components/atoms/Spinner'
import LoginButton from '../../../components/atoms/LoginButton'

interface ManageCloudStorageFormProps {
  storage: PouchNoteStorage
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
  const { t } = useTranslation()

  const [foldedDestructiveButtons, setFoldedDestructiveButtons] = useState(true)

  const unlinkCloudStorage = useCallback(() => {
    db.unlinkStorage(storage.id)
  }, [db, storage.id])

  const { messageBox } = useDialog()
  const { pushMessage } = useToast()
  const [deleting, setDeleting] = useState(false)
  const unmountRef = useRef(false)

  const removeAndUnlinkCloudStorage = useCallback(() => {
    const cloudStorage = storage.cloudStorage!
    messageBox({
      title: `Remove "${cloudStorage.name}"(id: ${cloudStorage.id}) cloud storage`,
      message: 'The cloud storage will be removed permanently.',
      iconType: DialogIconTypes.Warning,
      buttons: [t('storage.remove'), t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        if (value === 0) {
          try {
            setDeleting(true)
            await deleteStorage(user, cloudStorage.id)
            db.unlinkStorage(storage.id)
          } catch (error) {
            pushMessage({
              title: t('general.networkError'),
              description: error.toString(),
            })
          }

          if (unmountRef.current) {
            return
          }
          setDeleting(false)
        }
      },
    })
  }, [messageBox, pushMessage, t, db, storage.id, storage.cloudStorage, user])

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
        <FormBlockquote>Sign in to manage the cloud storage</FormBlockquote>
        <LoginButton
          onErr={() => {
            pushMessage({
              title: 'Cloud Error',
              description:
                'An error occured while attempting to create a cloud storage',
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

      <FormGroup>
        <FormLabel>Cloud storage ID</FormLabel>
        <FormTextInput
          type='text'
          disabled={true}
          readOnly={true}
          defaultValue={storage.cloudStorage!.id}
        />
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
      <FormHeading depth={3}>Unlink / Remove cloud storage</FormHeading>
      {foldedDestructiveButtons ? (
        <FormGroup>
          <FormSecondaryButton
            onClick={() => {
              setFoldedDestructiveButtons(false)
            }}
          >
            Unlink / Remove cloud storage
          </FormSecondaryButton>
        </FormGroup>
      ) : (
        <>
          <FormGroup>
            <FormSecondaryButton
              onClick={() => {
                setFoldedDestructiveButtons(true)
              }}
            >
              Hide buttons
            </FormSecondaryButton>
          </FormGroup>
          <FormBlockquote>
            Simply removing the link between the storage in this device(or
            browser) and the cloud storage. This action will not any data from
            both side, local device and cloud. Once it is done, you can always
            link the storage to any cloud storage.
          </FormBlockquote>
          <FormGroup>
            <FormSecondaryButton
              disabled={deleting}
              onClick={unlinkCloudStorage}
            >
              Unlink cloud storage
            </FormSecondaryButton>
          </FormGroup>
          <FormBlockquote>
            Removing and unlinking cloud storage. This action will delete the
            cloud storage only. So the storage will become a local storage.
          </FormBlockquote>
          <FormGroup>
            <FormSecondaryButton
              disabled={deleting}
              onClick={removeAndUnlinkCloudStorage}
            >
              Remove cloud storage
            </FormSecondaryButton>
          </FormGroup>
        </>
      )}
    </>
  )
}

export default ManageCloudStorageForm
