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
import styled from '../../shared/lib/styled'
import Button from '../../shared/components/atoms/Button'
import ButtonGroup from '../../shared/components/atoms/ButtonGroup'

const FormFolderSelectButtonContainer = styled.div`
  .form__folder__select__button--width {
    width: 100%;
  }
`

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
                className: 'workspace__create__form__space__name',
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
                <ButtonGroup>
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
                  <FormFolderSelectButtonContainer>
                    <Button
                      className={'form__folder__select__button--width'}
                      variant={'primary'}
                      onClick={openDialogAndStoreLocation}
                    >
                      Select
                    </Button>
                  </FormFolderSelectButtonContainer>
                </ButtonGroup>
              ),
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
