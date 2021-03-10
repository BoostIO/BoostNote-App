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
  FormPrimaryButton,
  FormLabelGroup,
  FormLabelGroupLabel,
  FormLabelGroupContent,
  FormControlGroup,
} from '../atoms/form'
import LinkCloudStorageForm from '../organisms/LinkCloudStorageForm'
import ImportLegacyNotesForm from '../organisms/ImportLegacyNotesForm'
import ConvertPouchStorageForm from '../organisms/ConvertPouchStorageForm'
import { appIsElectron, openNew } from '../../lib/platform'
import { usePreferences } from '../../lib/preferences'
import {
  boostHubLearnMorePageUrl,
  boostHubPricingPageUrl,
} from '../../lib/boosthub'
import Alert from '../atoms/Alert'
import InlineLinkButton from '../atoms/InlineLinkButton'

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
        <Alert variant='danger'>
          <h1 style={{ marginTop: 0 }}>⚠️ Action Required!</h1>
          <p>
            We have renewed our cloud storage solution and decided{' '}
            <strong>
              to deprecate the legacy cloud storage on March 31st.{' '}
            </strong>
            Please migrate your data to the new cloud space and{' '}
            <strong>get a 3 months free coupon</strong>.(Monthly fee: $3) You
            can also convert this storage into a file system based local space.
          </p>
        </Alert>
      )}
      <h2>Space Settings</h2>
      {storage.type === 'fs' && <p>Location : {storage.location}</p>}

      {storage.type === 'pouch' && storage.cloudStorage == null && (
        <LinkCloudStorageForm storage={storage} />
      )}

      <FormLabelGroup>
        <FormLabelGroupLabel>Space Name</FormLabelGroupLabel>
        <FormLabelGroupContent>
          <FormTextInput
            type='text'
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewName(e.target.value)
            }
          />
        </FormLabelGroupContent>
      </FormLabelGroup>
      <FormControlGroup>
        <FormPrimaryButton onClick={updateStorageName}>Save</FormPrimaryButton>
      </FormControlGroup>

      <hr />
      <FormHeading depth={2}>Migrate data to cloud space</FormHeading>
      <Alert>
        <h2>⚠️ Notice</h2>
        <ol>
          <li>
            We highly recommend you to migrate your local data to a cloud space
            so you can access useful features like document revision history,
            public APIs, document public sharing, 2000 tools integration and
            more. Please click{' '}
            <a
              onClick={(event) => {
                event.preventDefault()
                openNew(boostHubLearnMorePageUrl)
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
            be available until March 31st.
          </li>
        </ol>
      </Alert>

      <FormGroup>
        <FormPrimaryButton onClick={() => openTab('migration')}>
          Start Migration
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

      <FormHeading depth={2}>Remove Space</FormHeading>
      <p>
        {storage.type !== 'fs' ? (
          <>
            This will permantly remove all notes locally stored in this space.
          </>
        ) : (
          <>
            This will not delete the actual data files in your disk. You can add
            it to the app again.
          </>
        )}
        &nbsp;
        <InlineLinkButton onClick={removeCallback}>Remove</InlineLinkButton>
      </p>
    </div>
  )
}

export default StorageEditPage
