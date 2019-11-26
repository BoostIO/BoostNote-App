import React, { useState } from 'react'
import { usePreferences } from '../../lib/preferences'
import { Section, SectionHeader } from '../PreferencesModal/styled'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import { CloudStorage } from '../../lib/accounts'
import LoginButton from '../atoms/LoginButton'
import CloudStorageSelector from './CloudStorageSelector'

export default () => {
  const db = useDb()
  const { preferences } = usePreferences()
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
        console.error('sync failed')
        // TODO: toast sync failure
      }
    }
  }

  return (
    <div>
      <Section>
        <SectionHeader>{t('storage.add')}</SectionHeader>
        <label>Storage Name</label>
        <input
          type='text'
          value={localName}
          onChange={e => setLocalName(e.target.value)}
        />
        <label>
          <input
            type='radio'
            checked={storageType === 'local'}
            onChange={() => setStorageType('local')}
          />
          Local
        </label>
        <label>
          <input
            type='radio'
            checked={storageType === 'cloud'}
            onChange={() => setStorageType('cloud')}
          />
          Cloud
        </label>
      </Section>
      <Section>
        {storageType === 'local' && (
          <>
            <button onClick={() => createStorageCallback()}>Add Storage</button>
          </>
        )}
        {!isLoggedIn && storageType === 'cloud' && (
          <>
            <p>You need to sign in to add a cloud folder</p>
            <LoginButton />
          </>
        )}
        {isLoggedIn && storageType === 'cloud' && (
          <CloudStorageSelector
            user={user}
            name={localName}
            onSelect={createStorageCallback}
            buttonText='Add Storage'
          />
        )}
      </Section>
    </div>
  )
}
