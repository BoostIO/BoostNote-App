import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from '../../lib/router'
import { useDb } from '../../lib/db'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { FormFolderSelectorInput } from '../atoms/form'
import { useToast } from '../../shared/lib/stores/toast'
import Form from '../../shared/components/molecules/Form'
import { openDialog } from '../../lib/exports'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getWorkspaceHref } from '../../lib/db/utils'

const FSStorageCreateForm = () => {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const { t } = useTranslation()
  const { push } = useRouter()
  const { createStorage } = useDb()
  const { pushMessage } = useToast()
  const { report } = useAnalytics()
  const { setGeneralStatus } = useGeneralStatus()

  const createStorageCallback = useCallback(async () => {
    try {
      const workspace = await createStorage(name, { type: 'fs', location })
      report(analyticsEvents.createStorage)
      setGeneralStatus({ lastSidebarStateLocalSpace: 'tree' })
      push(getWorkspaceHref(workspace))
    } catch (error) {
      pushMessage({
        title: 'Something went wrong',
        description: error.toString(),
      })
    }
  }, [
    createStorage,
    name,
    location,
    report,
    setGeneralStatus,
    push,
    pushMessage,
  ])

  const openDialogAndStoreLocation = useCallback(async () => {
    const location = await openDialog()
    setLocation(location)
  }, [setLocation])

  return (
    <Form
      rows={[
        {
          title: t('storage.name'),
          items: [
            {
              type: 'input',
              props: {
                type: 'text',
                value: name,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value),
              },
            },
          ],
        },
        {
          title: 'Location',
          items: [
            {
              type: 'node',
              element: (
                <FormFolderSelectorInput
                  type='text'
                  onClick={openDialogAndStoreLocation}
                  readOnly
                  value={
                    location.trim().length === 0
                      ? t('folder.noLocationSelected')
                      : location
                  }
                />
              ),
            },
            {
              type: 'button',
              props: {
                label: 'Select Folder',
                variant: 'primary',
                onClick: openDialogAndStoreLocation,
              },
            },
          ],
        },
        {
          items: [
            {
              type: 'button',
              props: {
                label: t('storage.create'),
                disabled:
                  name.trim().length === 0 || location.trim().length === 0,
                onClick: createStorageCallback,
              },
            },
          ],
        },
      ]}
    />
  )
}

export default FSStorageCreateForm
