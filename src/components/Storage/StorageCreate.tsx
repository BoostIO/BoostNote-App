import React, { useState } from 'react'
import { usePreferences } from '../../lib/preferences'
import {
  SectionMargin,
  SectionHeader1,
  RightMargin,
  SectionPrimaryButton
} from '../PreferencesModal/styled'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import { CloudStorage } from '../../lib/accounts'
import LoginButton from '../atoms/LoginButton'
import CloudStorageSelector from './CloudStorageSelector'
import { useToast } from '../../lib/toast'

export default () => {
  const db = useDb()
  const { preferences } = usePreferences()
  const { pushMessage } = useToast()
  const { t } = useTranslation()
  const [localName, setLocalName] = useState('')
  const [storageType, setStorageType] = useState<'cloud' | 'local'>('cloud')

  const user = preferences['general.accounts'][0]

  const isLoggedIn = user != null

  const createStorageCallback = async (cloudStorage?: CloudStorage) => {
    const newStorage = await db.createStorage(localName)

    if (cloudStorage != null) {
      const success = db.setCloudLink(newStorage.id, cloudStorage, user)
      if (!success) {
        pushMessage({
          title: 'Sync Error',
          description: 'The storage was unable to be synced with the cloud'
        })
      }
    }
  }

  return (
    <div>
      <SectionMargin>
        <SectionHeader1>{t('Create new storage')}</SectionHeader1>
        <RightMargin>
          <label>Storage Name</label>
        </RightMargin>
        <RightMargin>
          <input
            type='text'
            value={localName}
            onChange={e => setLocalName(e.target.value)}
          />
        </RightMargin>
        <RightMargin>
          <label>
            <input
              type='radio'
              checked={storageType === 'cloud'}
              onChange={() => setStorageType('cloud')}
            />
            Cloud
          </label>
        </RightMargin>
        <label>
          <input
            type='radio'
            checked={storageType === 'local'}
            onChange={() => setStorageType('local')}
          />
          Local
        </label>

        {storageType === 'local' && (
          <>
            <div>
              <SectionPrimaryButton onClick={() => createStorageCallback()}>
                Create Storage
              </SectionPrimaryButton>
            </div>
          </>
        )}
        {!isLoggedIn && storageType === 'cloud' && (
          <>
            <p>You need to sign in to create a cloud storage.</p>
            <LoginButton
              onErr={console.error /* TODO: Toast error */}
              ButtonComponent={SectionPrimaryButton}
            />
          </>
        )}
        {isLoggedIn && storageType === 'cloud' && (
          <CloudStorageSelector
            user={user}
            name={localName}
            onSelect={createStorageCallback}
            buttonText='Create a storage'
          />
        )}
      </SectionMargin>
    </div>
  )
}
