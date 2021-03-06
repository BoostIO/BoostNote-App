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
import { appIsElectron, openNew } from '../../lib/platform'
import { usePreferences } from '../../lib/preferences'
import {
  boostHubLearnMorePageUrl,
  boostHubPricingPageUrl,
} from '../../lib/boosthub'

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
  const { openTab } = usePreferences()

  const removeCallback = useCallback(() => {
    messageBox({
      title: t('storage.delete', { storage: storage.name }),
      message:
        storage.type === 'fs'
          ? "This operation won't delete the actual data files in your disk. You can add it to the app again."
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
              description: `An error occurred while deleting space (id: ${storage.id})`,
            })
          }
        }
      },
    })
  }, [storage, t, db, router, messageBox, pushMessage])

  const updateStorageName = useCallback(() => {
    db.renameStorage(storage.id, newName)
  }, [storage.id, db, newName])

  return (
    <div>
      {storage.type === 'pouch' && storage.cloudStorage != null && (
        <FormBlockquote variant='danger'>
          <div>
            <h1 style={{ marginTop: 0 }}>⚠️ Action Required!</h1>
            <p>
              We have renewed our cloud storage solution and decided{' '}
              <strong>
                to deprecate the legacy cloud storage at 31th March.{' '}
              </strong>
              Please migrate your data to the new cloud space and{' '}
              <strong>get a 3 months free coupon</strong>.(Monthly fee: $3) You
              can also convert this storage into a file system based local
              space.
            </p>
          </div>
        </FormBlockquote>
      )}
      <h2>
        Storage Info{' '}
        <small>
          (type: {storage.type === 'fs' ? 'File System' : 'PouchDB'})
        </small>
      </h2>
      {storage.type === 'fs' && <p>Location : {storage.location}</p>}

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
      </FormGroup>

      {storage.type === 'fs' && (
        <>
          <hr />
          <ImportLegacyNotesForm storageId={storage.id} />
        </>
      )}

      {storage.type === 'pouch' && appIsElectron && (
        <>
          <hr />
          <ConvertPouchStorageForm
            storageId={storage.id}
            storageName={storage.name}
          />
        </>
      )}
      <hr />
      <FormHeading depth={2}>Migrate data to cloud space</FormHeading>
      <FormBlockquote>
        <h2 style={{ marginTop: 0 }}>Notice</h2>
        <ol>
          <li>
            We highly recommend you to migrate your local data to a cloud space
            so you can access useful features like document revision history,
            public APIs, document public sharing, 2000 tools integration and
            more. Please click{' '}
            <a
              onClick={(event) => {
                event.preventDefault()
                openNew(boostHubPricingPageUrl)
              }}
              href={boostHubLearnMorePageUrl}
            >
              here
            </a>{' '}
            to check it out.
          </li>
          <li>
            Some features are limited based on your pricing plan. Please try Pro
            trial to access all of them for 2 weeks for free. Check our{' '}
            <a
              onClick={(event) => {
                event.preventDefault()
                openNew(boostHubPricingPageUrl)
              }}
              href={boostHubPricingPageUrl}
            >
              pricing plan
            </a>{' '}
            to know more.
          </li>
          <li>
            Migrated documents will not be counted to the document limitation of
            free plan. Please try out a cloud space today!
          </li>
          <li>
            You will get a 3 Months free coupon after migration. This deal will
            be available until 31th March.
          </li>
        </ol>
      </FormBlockquote>

      <FormPrimaryButton onClick={() => openTab('migration')}>
        Start Migration
      </FormPrimaryButton>

      {storage.type !== 'fs' && (
        <>
          <hr />
          <FormHeading depth={2}>
            Cloud Info{' '}
            {storage.cloudStorage != null && (
              <small>(ID: {storage.cloudStorage.id})</small>
            )}
          </FormHeading>
          {storage.cloudStorage == null ? (
            <LinkCloudStorageForm storage={storage} />
          ) : (
            <ManageCloudStorageForm storage={storage as any} />
          )}
        </>
      )}
      <hr />
      <FormHeading depth={2}>Remove Space</FormHeading>
      {storage.type !== 'fs' && storage.cloudStorage != null && (
        <FormBlockquote>
          Your space in the legacy cloud server will not be deleted. To delete
          data in the server, check cloud info section.
        </FormBlockquote>
      )}
      <FormGroup>
        <FormSecondaryButton onClick={removeCallback}>
          Remove Space
        </FormSecondaryButton>
      </FormGroup>
    </div>
  )
}

export default StorageEditPage
