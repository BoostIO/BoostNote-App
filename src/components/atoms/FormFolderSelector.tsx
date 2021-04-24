import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPathByName, showOpenDialog } from '../../lib/electronOnly'
import styled from '../../shared/lib/styled'
import { border } from '../../shared/lib/styled/styleFunctions'
import Form from '../../shared/components/molecules/Form'

const FormFolderSelectorInput = styled.input`
  display: block;
  flex: 1;
  padding: 0.375rem 0.75rem;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  ${border};
  background-color: white;
  cursor: pointer;
  &:disabled {
    color: gray;
    background-color: #ccc;
  }
`

interface FormFolderSelector {
  value: string
  setValue: (value: string) => void
}

const FormFolderSelector = ({ value, setValue }: FormFolderSelector) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const { t } = useTranslation()
  const openDialog = useCallback(async () => {
    if (dialogIsOpen) {
      return
    }
    setDialogIsOpen(true)
    try {
      const result = await showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: t('folder.select'),
        defaultPath: getPathByName('home'),
      })
      if (result.canceled) {
        return
      }
      if (result.filePaths == null) {
        return
      }

      setValue(result.filePaths[0])
    } catch (error) {
      throw error
    } finally {
      setDialogIsOpen(false)
    }
  }, [dialogIsOpen, setValue, t])

  return (
    <Form
      rows={[
        {
          items: [
            {
              type: 'node',
              element: (
                <FormFolderSelectorInput
                  type='text'
                  onClick={openDialog}
                  readOnly
                  value={
                    value.trim().length === 0
                      ? t('folder.noLocationSelected')
                      : value
                  }
                />
              ),
            },
            {
              type: 'button',
              props: {
                label: 'Select Folder',
                variant: 'primary',
                onClick: openDialog,
              },
            },
          ],
        },
      ]}
    />
  )
}

export default FormFolderSelector
