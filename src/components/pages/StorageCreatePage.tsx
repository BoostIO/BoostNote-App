import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageContainer from '../atoms/PageContainer'
import {
  FormGroup,
  FormCheckInlineItem,
  FormCheckList,
  FormLabel,
} from '../atoms/form'
import LocalStorageCreateForm from '../organisms/LocalStorageCreateForm'
import CloudStorageCreateForm from '../organisms/CloudStorageCreateForm'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiBookPlusMultiple } from '@mdi/js'
import PageScrollableContent from '../atoms/PageScrollableContent'

const StorageCreatePage = () => {
  const { t } = useTranslation()
  const [storageType, setStorageType] = useState<'cloud' | 'local'>('cloud')

  return (
    <PageContainer>
      <PageDraggableHeader
        iconPath={mdiBookPlusMultiple}
        label={t('Create new storage')}
      />
      <PageScrollableContent>
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
      </PageScrollableContent>
    </PageContainer>
  )
}

export default StorageCreatePage
