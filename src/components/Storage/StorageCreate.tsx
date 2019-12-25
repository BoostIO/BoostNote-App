import React, { useState } from 'react'
import { usePreferences } from '../../lib/preferences'
import {
  SectionMargin,
  SectionHeader1,
  RightMargin,
  TopMargin,
  SectionPrimaryButton
} from '../PreferencesModal/styled'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import LoginButton from '../atoms/LoginButton'
import { useToast } from '../../lib/toast'
import { useRouter } from '../../lib/router'

export default () => {
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
      <SectionMargin>
        <SectionHeader1>{t('Create new storage')}</SectionHeader1>
        <RightMargin>
          <label>{t('storage.name')}</label>
        </RightMargin>
        <RightMargin>
          <input
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </RightMargin>
        <RightMargin>
          <label>
            <input
              type='radio'
              checked={storageType === 'cloud'}
              onChange={() => setStorageType('cloud')}
            />
            {t('storage.typeCloud')}
          </label>
        </RightMargin>
        <label>
          <input
            type='radio'
            checked={storageType === 'local'}
            onChange={() => setStorageType('local')}
          />
          {t('storage.typeLocal')}
        </label>

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
      </SectionMargin>
    </div>
  )
}
