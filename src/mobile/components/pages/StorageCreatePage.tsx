import React, { useState } from 'react'
import { usePreferences } from '../../../lib/preferences'
import styled from '../../../lib/styled'
import {
  TopMargin,
  SectionPrimaryButton
} from '../../../components/PreferencesModal/styled'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import LoginButton from '../../../components/atoms/LoginButton'
import { useToast } from '../../../lib/toast'
import { useRouter } from '../../lib/router'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarToggleNavButton from '../atoms/TopBarToggleNavButton'

const StorageCreatePageContainer = styled.div`
  padding: 15px;
`

const FormSection = styled.section`
  margin-bottom: 15px;
`

const StorageCreatePage = () => {
  const db = useDb()
  const { preferences } = usePreferences()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [storageType, setStorageType] = useState<'cloud' | 'local'>('cloud')
  const { push } = useRouter()

  const user = preferences['general.accounts'][0]

  const isLoggedIn = user != null

  const createStorageCallback = async () => {
    // editStoragePage edits cloud storage directly
    // update local -> update cloud -> on fail -> revert local
    try {
      const storage = await db.createStorage(name, storageType)
      push(`/m/storages/${storage.id}/notes`)
    } catch {
      pushMessage({
        title: 'Cloud Error',
        description:
          'An error occured while attempting to create a cloud storage'
      })
    }
  }

  return (
    <TopBarLayout leftControl={<TopBarToggleNavButton />} title='New Storage'>
      <StorageCreatePageContainer>
        <FormSection>
          <label>{t('storage.name')}</label>
          <div>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        </FormSection>
        <FormSection>
          <label>
            <input
              type='radio'
              checked={storageType === 'cloud'}
              onChange={() => setStorageType('cloud')}
            />
            {t('storage.typeCloud')}
          </label>
          <label>
            <input
              type='radio'
              checked={storageType === 'local'}
              onChange={() => setStorageType('local')}
            />
            {t('storage.typeLocal')}
          </label>
        </FormSection>

        {(storageType === 'local' || isLoggedIn) && (
          <>
            <TopMargin>
              <SectionPrimaryButton onClick={() => createStorageCallback()}>
                {t('storage.create')}
              </SectionPrimaryButton>
            </TopMargin>
          </>
        )}
        {!isLoggedIn && storageType === 'cloud' && (
          <>
            <TopMargin>
              <p>{t('storage.needSignIn')}</p>
              <LoginButton
                onErr={console.error /* TODO: Toast error */}
                ButtonComponent={SectionPrimaryButton}
              />
            </TopMargin>
          </>
        )}
      </StorageCreatePageContainer>
    </TopBarLayout>
  )
}

export default StorageCreatePage
