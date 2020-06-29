import React, { useState, useCallback } from 'react'
import {
  FormGroup,
  FormLabel,
  FormPrimaryButton,
  FormTextInput,
  FormSecondaryButton,
} from '../atoms/form'
import { useTranslation } from 'react-i18next'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { useToast } from '../../lib/toast'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { Stats } from 'fs'

declare function $showOpenDialog(
  options: Electron.OpenDialogOptions
): Promise<Electron.OpenDialogReturnValue>
declare function $getHomePath(): string
declare function $stat(pathname: string): Promise<Stats>

const FSStorageCreateForm = () => {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const { t } = useTranslation()
  const { push } = useRouter()
  const { createStorage } = useDb()
  const { pushMessage } = useToast()
  const { report } = useAnalytics()
  const createStorageCallback = useCallback(async () => {
    try {
      const storage = await createStorage(name, { type: 'fs', location })
      report(analyticsEvents.createStorage)
      push(`/app/storages/${storage.id}/notes`)
    } catch (error) {
      pushMessage({
        title: 'Something went wrong',
        description: error.toString(),
      })
    }
  }, [createStorage, location, name, push, report, pushMessage])
  const openDialog = useCallback(async () => {
    const result = await $showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Folder',
      defaultPath: $getHomePath(),
    })
    if (result.canceled) {
      return
    }
    if (result.filePaths == null) {
      return
    }

    setLocation(result.filePaths[0])
  }, [])
  return (
    <>
      <FormGroup>
        <FormLabel>{t('storage.name')}</FormLabel>
        <FormTextInput
          type='text'
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <FormLabel>Location</FormLabel>
        <div>{location.trim().length === 0 ? 'Empty' : location}</div>
        <FormSecondaryButton onClick={openDialog}>
          Select Folder
        </FormSecondaryButton>
      </FormGroup>
      <FormGroup>
        <FormPrimaryButton
          onClick={createStorageCallback}
          disabled={name.trim().length === 0 || location.trim().length === 0}
        >
          Create Storage
        </FormPrimaryButton>
      </FormGroup>
    </>
  )
}

export default FSStorageCreateForm
