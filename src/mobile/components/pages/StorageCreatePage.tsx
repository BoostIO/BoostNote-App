import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarToggleNavButton from '../atoms/TopBarToggleNavButton'
import {
  FormHeading,
  FormGroup,
  FormLabel,
  FormCheckList,
  FormCheckInlineItem,
} from '../../../components/atoms/form'
import LocalStorageCreateForm from '../organisms/LocalStorageCreateForm'
import CloudStorageCreateForm from '../organisms/CloudStorageCreateForm'
import PageContainer from '../../../components/atoms/PageContainer'

const StorageCreatePage = () => {
  const { t } = useTranslation()
  const [storageType, setStorageType] = useState<'cloud' | 'local'>('cloud')

  return (
    <TopBarLayout leftControl={<TopBarToggleNavButton />} title='New Storage'>
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
    </TopBarLayout>
  )
}

export default StorageCreatePage
