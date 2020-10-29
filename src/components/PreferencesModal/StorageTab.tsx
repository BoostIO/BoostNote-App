import React, { useCallback, useState } from 'react'
import { useDb } from '../../lib/db'
import { NoteStorage } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useToast } from '../../lib/toast'
import { useTranslation } from 'react-i18next'
import {
  FormHeading,
  FormGroup,
  FormTextInput,
  FormBlockquote,
  FormPrimaryButton,
  FormSecondaryButton,
} from '../atoms/form'
import LinkCloudStorageForm from '../organisms/LinkCloudStorageForm'
import ManageCloudStorageForm from '../organisms/ManageCloudStorageForm'
import ImportLegacyNotesForm from '../organisms/ImportLegacyNotesForm'
import ConvertPouchStorageForm from '../organisms/ConvertPouchStorageForm'
import { appIsElectron } from '../../lib/platform'

interface StorageEditPageProps {
  storage: NoteStorage
}

const StorageEditPage = ({ storage }: StorageEditPageProps) => {
  const db = useDb()
  const router = useRouter()
  const { t } = useTranslation()
  const [newName, setNewName] = useState(storage.name)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()
  const [editingName, setEditingName] = useState(false)

  const startEditingName = useCallback(() => {
    setNewName(storage.name)
    setEditingName(true)
  }, [storage.name])

  const removeCallback = useCallback(() => {
    messageBox({
      title: t('storage.delete', { storage: storage.name }),
      message:
        storage.type === 'fs'
          ? "This operation won't delete the actual storage folder. You can add it to the app again."
          : t('storage.removeMessage'),
      iconType: DialogIconTypes.Warning,
      buttons: [t('storage.remove'), t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        if (value === 0) {
          try {
            await db.removeStorage(storage.id)
            router.push('/app')
          } catch {
            pushMessage({
              title: t('general.networkError'),
              description: `An error occurred while deleting storage (id: ${storage.id})`,
            })
          }
        }
      },
    })
  }, [storage, t, db, router, messageBox, pushMessage])

  const updateStorageName = useCallback(() => {
    db.renameStorage(storage.id, newName)
    setEditingName(false)
  }, [storage.id, db, newName])

  const [importLegacyFormIsFolded, setImportLegacyFormIsFolded] = useState(true)

  const openImportLegacyForm = useCallback(() => {
    setImportLegacyFormIsFolded(false)
  }, [])

  const foldImportLegacyForm = useCallback(() => {
    setImportLegacyFormIsFolded(true)
  }, [])

  const [convertPouchFormIsFolded, setConvertPouchFormIsFolded] = useState(true)

  const openConvertPouchForm = useCallback(() => {
    setConvertPouchFormIsFolded(false)
  }, [])

  const foldConvertPouchForm = useCallback(() => {
    setConvertPouchFormIsFolded(true)
  }, [])

  return (
    <div>
      <h2>Storage Name</h2>
      {!editingName ? (
        <>
          <p>{storage.name}</p>
          <FormGroup>
            <FormSecondaryButton onClick={startEditingName}>
              Edit
            </FormSecondaryButton>
          </FormGroup>
        </>
      ) : (
        <>
          <FormGroup>
            <FormTextInput
              type='text'
              value={newName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewName(e.target.value)
              }
            />
          </FormGroup>
          <FormGroup>
            <FormPrimaryButton onClick={updateStorageName}>
              Update
            </FormPrimaryButton>
            <FormSecondaryButton
              onClick={() => {
                setEditingName(false)
              }}
            >
              Cancel
            </FormSecondaryButton>
          </FormGroup>
        </>
      )}
      <h2>Storage Type</h2>
      <p>{storage.type === 'fs' ? 'File System' : 'PouchDB'}</p>
      {storage.type === 'fs' && (
        <>
          <h2>Storage Location</h2>
          <p>{storage.location}</p>
        </>
      )}

      {storage.type === 'fs' && (
        <>
          <hr />
          <FormHeading depth={2}>
            Import Notes from Legacy BoostNote
          </FormHeading>
          {importLegacyFormIsFolded ? (
            <FormGroup>
              <FormSecondaryButton onClick={openImportLegacyForm}>
                Import
              </FormSecondaryButton>
            </FormGroup>
          ) : (
            <ImportLegacyNotesForm
              storageId={storage.id}
              onCancel={foldImportLegacyForm}
            />
          )}
        </>
      )}

      {storage.type === 'pouch' && appIsElectron && (
        <>
          <hr />

          <FormHeading depth={2}>Convert File System based Storage</FormHeading>
          {convertPouchFormIsFolded ? (
            <FormGroup>
              <FormSecondaryButton onClick={openConvertPouchForm}>
                Convert
              </FormSecondaryButton>
            </FormGroup>
          ) : (
            <ConvertPouchStorageForm
              storageId={storage.id}
              storageName={storage.name}
              onCancel={foldConvertPouchForm}
            />
          )}
        </>
      )}
      <hr />
      <FormHeading depth={2}>Remove Storage</FormHeading>
      {storage.type !== 'fs' && storage.cloudStorage != null && (
        <FormBlockquote>
          Your cloud storage will not be deleted. To delete cloud storage too,
          check cloud storage info section.
        </FormBlockquote>
      )}
      <FormGroup>
        <FormSecondaryButton onClick={removeCallback}>
          Remove Storage
        </FormSecondaryButton>
      </FormGroup>

      {storage.type !== 'fs' && (
        <>
          <hr />
          <FormHeading depth={2}>Cloud Storage info</FormHeading>
          {storage.cloudStorage == null ? (
            <LinkCloudStorageForm storage={storage} />
          ) : (
            <ManageCloudStorageForm storage={storage as any} />
          )}
        </>
      )}
    </div>
  )
}

export default StorageEditPage
