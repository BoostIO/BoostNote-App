import React, { useCallback, useState } from 'react'
import { useDb } from '../../lib/db'
import { NoteStorage, PouchNoteStorage } from '../../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useToast } from '../../../lib/toast'
import { useTranslation } from 'react-i18next'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarToggleNavButton from '../atoms/TopBarToggleNavButton'
import {
  FormGroup,
  FormLabel,
  FormTextInput,
  FormHeading,
  FormPrimaryButton,
  FormBlockquote,
  FormSecondaryButton,
} from '../../../components/atoms/form'
import LinkCloudStorageForm from '../organisms/LinkCloudStorageForm'
import ManageCloudStorageForm from '../organisms/ManageCloudStorageForm'
import PageContainer from '../../../components/atoms/PageContainer'

interface StorageEditPageProps {
  storage: NoteStorage
}

const StorageEditPage = ({ storage }: StorageEditPageProps) => {
  const db = useDb()
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState(storage.name)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()
  const storageHasCloudStorage =
    storage.type !== 'fs' && storage.cloudStorage != null

  const removeCallback = useCallback(() => {
    messageBox({
      title: `Remove "${storage.name}" storage`,
      message: t('storage.removeMessage'),
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
    db.renameStorage(storage.id, name)
  }, [storage.id, db, name])

  return (
    <TopBarLayout
      leftControl={<TopBarToggleNavButton />}
      titleLabel={t('storage.edit')}
    >
      <PageContainer>
        <FormGroup>
          <FormLabel>{t('storage.name')}</FormLabel>
          <FormTextInput
            type='text'
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
        </FormGroup>
        <FormGroup>
          <FormPrimaryButton onClick={updateStorageName}>
            Update storage name
          </FormPrimaryButton>
        </FormGroup>
        <hr />
        <FormHeading depth={2}>Remove Storage</FormHeading>
        {storageHasCloudStorage != null && (
          <FormBlockquote>
            Your cloud storage will not be deleted by clicking this button. To
            delete cloud storage too, check cloud storage info section.
          </FormBlockquote>
        )}
        <FormGroup>
          <FormSecondaryButton onClick={removeCallback}>
            Remove Storage
          </FormSecondaryButton>
        </FormGroup>
        <hr />

        <FormHeading depth={2}>Cloud Storage info</FormHeading>
        {storageHasCloudStorage == null ? (
          <LinkCloudStorageForm storage={storage} />
        ) : (
          <ManageCloudStorageForm storage={storage as PouchNoteStorage} />
        )}
      </PageContainer>
    </TopBarLayout>
  )
}

export default StorageEditPage
