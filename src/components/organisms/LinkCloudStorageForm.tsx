import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
  FormGroup,
  FormPrimaryButton,
  FormSecondaryButton,
  FormCheckItem,
} from '../atoms/form'
import { usePreferences } from '../../lib/preferences'
import { useToast } from '../../lib/toast'
import { useEffectOnce } from 'react-use'
import { NoteStorage } from '../../lib/db/types'
import Spinner from '../atoms/Spinner'
import { useDb } from '../../lib/db'
import { CloudStorage, getStorages } from '../../lib/accounts'
import InlineLinkButton from '../atoms/InlineLinkButton'
import Alert from '../atoms/Alert'
import LoginButton from '../atoms/LoginButton'

interface LinkCloudStorageFormProps {
  storage: NoteStorage
}

const LinkCloudStorageForm = ({ storage }: LinkCloudStorageFormProps) => {
  const { preferences } = usePreferences()
  const user = preferences['general.accounts'][0]
  const { pushMessage } = useToast()
  const [folded, setFolded] = useState(true)

  const unmountRef = useRef(false)

  const [targetRemoteStorageId, setTargetRemoteStorageId] = useState<
    null | string
  >(null)
  const [remoteStorageList, setRemoteStorageList] = useState<CloudStorage[]>([])
  const [fetching, setFetching] = useState(false)
  const db = useDb()
  const [linking, setLinking] = useState(false)

  const targetRemoteStorage = useMemo(() => {
    for (const remoteStorage of remoteStorageList) {
      if (remoteStorage.id.toString() === targetRemoteStorageId) {
        return remoteStorage
      }
    }
    return null
  }, [remoteStorageList, targetRemoteStorageId])

  const fetchRemoteStorage = useCallback(async () => {
    if (user == null) {
      return
    }
    setFetching(true)
    setRemoteStorageList([])
    try {
      const storages = await getStorages(user)
      setRemoteStorageList(storages)
    } catch (error) {
      pushMessage({
        title: 'Cloud Error',
        description:
          'An error occured while attempting to fetch legacy cloud space list',
      })
    }

    if (unmountRef.current) {
      return
    }
    setFetching(false)
  }, [user, pushMessage])

  const openForm = useCallback(() => {
    setFolded(false)
    fetchRemoteStorage()
  }, [fetchRemoteStorage])

  const closeForm = useCallback(() => {
    setFolded(true)
  }, [])

  useEffectOnce(() => {
    return () => {
      unmountRef.current = true
    }
  })

  const { setPreferences } = usePreferences()

  const linkStorage = useCallback(async () => {
    setLinking(true)
    try {
      const cloudStorage = targetRemoteStorage
      if (cloudStorage == null) {
        throw new Error('The legacy cloud storage does not exist')
      }
      db.linkStorage(storage.id, {
        id: cloudStorage.id,
        name: cloudStorage.name,
        size: cloudStorage.size,
        syncedAt: Date.now(),
      })
      db.syncStorage(storage.id)
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: error.toString(),
      })
    }

    setLinking(false)
  }, [pushMessage, db, storage.id, targetRemoteStorage])

  const [signingInMessage, setSigningInMessage] = useState<null | string>(null)
  if (user == null) {
    return (
      <>
        {signingInMessage != null && <p>{signingInMessage}</p>}
        <FormGroup>
          <LoginButton
            ButtonComponent={InlineLinkButton}
            onLoginComplete={() => {
              setSigningInMessage(null)
              openForm()
              fetchRemoteStorage()
            }}
            onLoginStart={() => {
              setSigningInMessage('Signing In...')
            }}
            onErr={() => {
              setSigningInMessage('Failed to sign in. Please try again')
            }}
          >
            Link to a deprecated legacy cloud space
          </LoginButton>
          (All deprecated legacy cloud spaces will be discarded on March 31st.)
        </FormGroup>
      </>
    )
  }

  return (
    <>
      <FormGroup>
        <InlineLinkButton onClick={folded ? openForm : closeForm}>
          Link to legacy cloud space
        </InlineLinkButton>
        (The legacy cloud space will be deprecated on March 31st)
      </FormGroup>
      {!folded && (
        <>
          <hr />
          <FormGroup>
            {!fetching && remoteStorageList.length === 0 && (
              <p>
                No space has been fetched. Click refresh button to try again.
              </p>
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
              <Spinner /> Fetching spaces in the legacy cloud...
            </FormGroup>
          )}

          <FormGroup>
            <InlineLinkButton onClick={fetchRemoteStorage} disabled={fetching}>
              Refresh spaces in the legacy cloud
            </InlineLinkButton>
            <InlineLinkButton
              className='inline-link--variant-danger'
              onClick={() => {
                setPreferences({
                  'general.accounts': [],
                })
              }}
              disabled={fetching}
            >
              Sign Out
            </InlineLinkButton>
          </FormGroup>

          {targetRemoteStorage != null && (
            <Alert variant='danger'>
              <strong>CAUTION!</strong> Your local space will be merged into the
              legacy cloud storage.{' '}
              <strong>THIS ACTION IS NOT REVERTIBLE.</strong> We are highly
              recommending to create a new local space from the existing legacy
              cloud space to prevent merging the space into wrong one.
            </Alert>
          )}
          <FormGroup>
            <FormPrimaryButton onClick={linkStorage} disabled={linking}>
              {linking ? 'Linking...' : 'Link to the legacy cloud space'}
            </FormPrimaryButton>
            <FormSecondaryButton onClick={closeForm} disabled={linking}>
              Cancel
            </FormSecondaryButton>
          </FormGroup>

          <hr />
        </>
      )}
    </>
  )
}

export default LinkCloudStorageForm
