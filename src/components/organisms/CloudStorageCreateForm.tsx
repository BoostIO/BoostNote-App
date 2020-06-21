import React, { useState, useCallback, useRef, useMemo } from 'react'
import {
  FormGroup,
  FormLabel,
  FormPrimaryButton,
  FormTextInput,
  FormSecondaryButton,
  FormCheckItem,
  FormBlockquote,
} from '../atoms/form'
import { useTranslation } from 'react-i18next'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { useToast } from '../../lib/toast'
import Spinner from '../atoms/Spinner'
import {
  getStorages,
  CloudStorage,
  createStorage as createCloudStorage,
} from '../../lib/accounts'
import { useFirstUser } from '../../lib/preferences'
import { useEffectOnce } from 'react-use'
import LoginButton from '../atoms/LoginButton'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'

const CloudStorageCreateForm = () => {
  const [storageName, setStorageName] = useState('')
  const [cloudStorageName, setCloudStorageName] = useState('')
  const { t } = useTranslation()
  const { push } = useRouter()
  const db = useDb()
  const { pushMessage } = useToast()
  const [creating, setCreating] = useState(false)
  const user = useFirstUser()

  const [fetching, setFetching] = useState(false)
  const [remoteStorageList, setRemoteStorageList] = useState<CloudStorage[]>([])

  const [usingSameName, setUsingSameName] = useState(true)

  const [targetRemoteStorageId, setTargetRemoteStorageId] = useState<
    null | string
  >(null)

  const { report } = useAnalytics()

  const targetRemoteStorage = useMemo(() => {
    for (const remoteStorage of remoteStorageList) {
      if (remoteStorage.id.toString() === targetRemoteStorageId) {
        return remoteStorage
      }
    }
    return null
  }, [remoteStorageList, targetRemoteStorageId])

  const createStorageCallback = useCallback(async () => {
    setCreating(true)
    try {
      const cloudStorage =
        targetRemoteStorage == null
          ? await createCloudStorage(
              usingSameName ? storageName : cloudStorageName,
              user
            )
          : targetRemoteStorage
      if (cloudStorage === 'SubscriptionRequired') {
        pushMessage({
          title: 'Subscription Required',
          description:
            'Please update subscription to create more cloud storage.',
        })
        setCreating(false)
        return
      }
      const storage = await db.createStorage(storageName)
      db.linkStorage(storage.id, {
        id: cloudStorage.id,
        name: cloudStorage.name,
        size: cloudStorage.size,
      })
      db.syncStorage(storage.id)
      report(analyticsEvents.createStorage)
      push(`/app/storages/${storage.id}/notes`)
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: error.toString(),
      })
      setCreating(false)
    }
  }, [
    targetRemoteStorage,
    usingSameName,
    storageName,
    cloudStorageName,
    user,
    db,
    push,
    pushMessage,
    report,
  ])

  const unmountRef = useRef(false)

  const fetchRemoteStorage = useCallback(async () => {
    if (user == null) {
      return
    }
    setFetching(true)
    setRemoteStorageList([])
    try {
      const storages = await getStorages(user)
      if (!unmountRef.current) {
        setRemoteStorageList(storages)
        setFetching(false)
      }
    } catch (error) {
      pushMessage({
        title: 'Failed to fetch cloud storage data',
        description: error.toString(),
      })
    }
  }, [user, pushMessage])

  useEffectOnce(() => {
    fetchRemoteStorage()
    return () => {
      unmountRef.current = true
    }
  })

  if (user == null) {
    return (
      <>
        <LoginButton
          onErr={() => {
            pushMessage({
              title: 'Cloud Error',
              description:
                'An error occured while attempting to create a cloud storage',
            })
          }}
          ButtonComponent={FormPrimaryButton}
        />
        <FormBlockquote>{t('storage.needSignIn')}</FormBlockquote>
      </>
    )
  }

  return (
    <>
      <FormGroup>
        <FormLabel>Remote Storage</FormLabel>
        <FormCheckItem
          id='radio-remote-storage-new'
          type='radio'
          checked={targetRemoteStorage == null}
          onChange={(event) => {
            if (event.target.checked) {
              setStorageName('')
              setCloudStorageName('')
              setTargetRemoteStorageId('new')
            }
          }}
        >
          New Storage
        </FormCheckItem>
        <hr />
        {!fetching && remoteStorageList.length === 0 && (
          <p>Remote storage does not exist.</p>
        )}
        {remoteStorageList.map((cloudStorage) => {
          const cloudStorageId = cloudStorage.id.toString()
          const id = `radio-remote-storage-${cloudStorageId}`
          return (
            <FormCheckItem
              id={id}
              key={id}
              type='radio'
              checked={targetRemoteStorageId === cloudStorageId}
              onChange={(event) => {
                if (event.target.checked) {
                  setStorageName(cloudStorage.name)
                  setTargetRemoteStorageId(cloudStorageId)
                }
              }}
            >
              {cloudStorage.name} (id: {cloudStorage.id})
            </FormCheckItem>
          )
        })}
      </FormGroup>
      {fetching && (
        <FormGroup>
          <Spinner /> Fetching cloud storage...
        </FormGroup>
      )}
      <FormGroup>
        <FormSecondaryButton onClick={fetchRemoteStorage} disabled={fetching}>
          Fetch cloud storage
        </FormSecondaryButton>
      </FormGroup>

      <FormGroup>
        <FormLabel>{t('storage.name')}</FormLabel>
        <FormTextInput
          type='text'
          value={
            usingSameName && targetRemoteStorage != null
              ? targetRemoteStorage!.name
              : storageName
          }
          disabled={usingSameName && targetRemoteStorage != null}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStorageName(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <FormCheckItem
          id='checkbox-same-storage-name'
          checked={usingSameName}
          onChange={(event) => {
            if (!event.target.checked) {
              setCloudStorageName(storageName)
            }
            setUsingSameName(event.target.checked)
          }}
        >
          Use the same name for cloud storage
        </FormCheckItem>
      </FormGroup>
      {!usingSameName && targetRemoteStorage == null && (
        <FormGroup>
          <FormLabel>Cloud Storage Name</FormLabel>
          <FormTextInput
            type='text'
            value={cloudStorageName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCloudStorageName(e.target.value)
            }
          />
        </FormGroup>
      )}
      <FormGroup>
        <FormPrimaryButton
          onClick={createStorageCallback}
          disabled={creating || fetching}
        >
          {creating
            ? 'Creating...'
            : fetching
            ? 'Fetching remote storage...'
            : 'Create Storage'}
        </FormPrimaryButton>
      </FormGroup>
    </>
  )
}

export default CloudStorageCreateForm
