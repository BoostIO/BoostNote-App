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
import FSStorageCreateForm from '../organisms/FSStorageCreateForm'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiBookPlusMultiple } from '@mdi/js'
import PageScrollableContent from '../atoms/PageScrollableContent'
import isElectron from 'is-electron'

const ELECTRON = isElectron()

type StorageType = 'cloud' | 'local' | 'fs'

interface StorageCreateFormProps {
  storageType: StorageType
}

const StorageCreateForm = ({ storageType }: StorageCreateFormProps) => {
  switch (storageType) {
    case 'cloud':
      return <CloudStorageCreateForm />
    case 'fs':
      return <FSStorageCreateForm />
    case 'local':
    default:
      return <LocalStorageCreateForm />
  }
}

const StorageCreatePage = () => {
  const { t } = useTranslation()
  const [storageType, setStorageType] = useState<'cloud' | 'local' | 'fs'>('fs')

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
            {ELECTRON && (
              <FormCheckInlineItem
                id='radio-localStorageType'
                type='radio'
                checked={storageType === 'fs'}
                onChange={() => setStorageType('fs')}
              >
                File System
              </FormCheckInlineItem>
            )}
            <FormCheckInlineItem
              id='radio-localStorageType'
              type='radio'
              checked={storageType === 'local'}
              onChange={() => setStorageType('local')}
            >
              {t('storage.typeLocal')}
            </FormCheckInlineItem>
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
          </FormCheckList>
        </FormGroup>

        <StorageCreateForm storageType={storageType} />
      </PageScrollableContent>
    </PageContainer>
  )
}

export default StorageCreatePage
