import React, { useState } from 'react'
import { usePreferences } from '../../lib/preferences'
import { TopMargin, SectionPrimaryButton } from '../PreferencesModal/styled'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import { useToast } from '../../lib/toast'
import { useRouter } from '../../lib/router'
import PageContainer from '../atoms/PageContainer'
import {
  FormHeading,
  FormGroup,
  FormCheckInlineItem,
  FormCheckList,
  FormLabel
} from '../atoms/form'
import LocalStorageCreateForm from '../organisms/LocalStorageCreateForm'
import CloudStorageCreateForm from '../organisms/CloudStorageCreateForm'

export default () => {
  const db = useDb()
  const { preferences } = usePreferences()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const [storageType, setStorageType] = useState<'cloud' | 'local'>('cloud')
  const { push } = useRouter()

  const user = preferences['general.accounts'][0]

  const isLoggedIn = user != null

  const createStorageCallback = async () => {
    // editStoragePage edits cloud storage directly
    // update local -> update cloud -> on fail -> revert local
    try {
      const storage = await db.createStorage(name, storageType)
      push(`/app/storages/${storage.id}/notes`)
    } catch {
      pushMessage({
        title: 'Cloud Error',
        description:
          'An error occured while attempting to create a cloud storage'
      })
    }
  }

  return (
    <div>
      <PageContainer>
        <FormHeading depth={1}>{t('Create new storage')}</FormHeading>
        <FormGroup>
          <FormLabel>Storage Type</FormLabel>
          <FormCheckList>
            <FormCheckInlineItem
              id='radio-cloudStorageType'
              type='radio'
              checked={storageType === 'cloud'}
              onChange={() => {
                setStorageType('cloud')
              }}
            >
              {t('storage.typeCloud')}
            </FormCheckInlineItem>
            <FormCheckInlineItem
              id='radio-localStorageType'
              type='radio'
              checked={storageType === 'local'}
              onChange={() => setStorageType('local')}
            >
              {t('storage.typeLocal')}
            </FormCheckInlineItem>
          </FormCheckList>
        </FormGroup>

        {storageType === 'local' ? (
          <LocalStorageCreateForm />
        ) : (
          <CloudStorageCreateForm />
        )}
      </PageContainer>
    </div>
  )
}
