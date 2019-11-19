/**
 * Necessary data
 *  - Subscription Plan
 *  - Cloud storages
 *  name on creation
 * default create new
 * dont limit to non-linked for now
 */
import React, { useState, useEffect } from 'react'
import { usePreferences } from '../../lib/preferences'
import { Section, SectionHeader } from '../PreferencesModal/styled'
import { useTranslation } from 'react-i18next'
import { useDb } from '../../lib/db'
import {
  getStorages,
  getSubscription,
  Subscription,
  CloudStorage,
  createStorage
} from '../../lib/accounts'
import LoginButton from '../atoms/LoginButton'

interface UserCloudInfo {
  storages: CloudStorage[]
  subscription: Subscription | undefined
}

export default () => {
  const db = useDb()
  const { preferences } = usePreferences()
  const { t } = useTranslation()
  const [localName, setLocalName] = useState('')
  const [link, setLink] = useState<number>(0)
  const [cloudName, setCloudName] = useState('')
  const [useSameName, setUseSameName] = useState(true)
  const [storageType, setStorageType] = useState<'cloud' | 'local'>('cloud')
  const [cloudInfo, setCloudInfo] = useState<UserCloudInfo>({
    storages: [],
    subscription: undefined
  })
  const [isLoading, setLoading] = useState(false)

  const user = preferences['general.accounts'][0]

  useEffect(() => {
    if (user != null) {
      Promise.all([getStorages(user), getSubscription(user)])
        .then(([storages, subscription]) => [
          setCloudInfo({
            storages,
            subscription
          })
        ])
        .catch(console.error)
    }
  }, [user])

  const isLoggedIn = user != null
  const canCreateCloudStorages =
    cloudInfo.subscription != null || cloudInfo.storages.length === 0

  const createStorageCallback = async () => {
    setLoading(true)
    const newStorage = await db.createStorage(localName)

    if (storageType === 'cloud') {
      let cloudLink = link
      if (link === 0) {
        const cloud = await createStorage(
          useSameName ? localName : cloudName,
          user
        )
        if (cloud !== 'SubscriptionRequired') {
          cloudLink = cloud.id
          setCloudInfo({
            ...cloudInfo,
            storages: [...cloudInfo.storages, cloud]
          })
        } else {
          // TODO: Toast error
        }
      }
      if (cloudLink !== 0) {
        await db.addCloudLink(newStorage.id, cloudLink)
      }
    }
    setLoading(false)
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
            <button onClick={createStorageCallback}>Add Storage</button>
          </>
        )}
        {!isLoggedIn && storageType === 'cloud' && (
          <>
            <p>You need to sign in to add a cloud folder</p>
            <LoginButton />
          </>
        )}
        {isLoggedIn && storageType === 'cloud' && !canCreateCloudStorages && (
          <>
            <p>You need to upgrade your plan to add a new storage cloud</p>
            <p>Current Plan: Basic</p>
            <p>New Plan: Premium ($3.00/month)</p>
            <button>Upgrade</button>
          </>
        )}

        {isLoggedIn && storageType === 'cloud' && canCreateCloudStorages && (
          <>
            <label>Link or Create Storage</label>
            <select
              value={link}
              onChange={({ target: { value } }) => setLink(parseInt(value, 10))}
            >
              <option value={0}>Create New</option>
              {cloudInfo.storages.map(storage => (
                <option key={storage.id} value={storage.id}>
                  {storage.name} (id:{storage.id})
                </option>
              ))}
            </select>
            <input
              type='checkbox'
              checked={useSameName}
              onChange={() => setUseSameName(!useSameName)}
            />
            <label>Use same name</label>
            {!useSameName && (
              <div>
                <label>Cloud Storage Name</label>
                <input
                  type='text'
                  value={cloudName}
                  onChange={e => setCloudName(e.target.value)}
                />
              </div>
            )}
            <div>
              <button onClick={createStorageCallback}>
                {!isLoading ? 'Add Storage' : '...'}
              </button>
            </div>
          </>
        )}
      </Section>
    </div>
  )
}
