import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '../../lib/styled'
import { border, secondaryButtonStyle } from '../../lib/styled/styleFunctions'
import { getHomePath, showOpenDialog } from '../../lib/electronOnly'

const FormFolderSelectorInput = styled.input`
  display: block;
  flex: 1;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  ${border}
  background-color: white;
  cursor: pointer;
  &:disabled {
    color: gray;
    background-color: #ccc;
  }
`

const FormFolderSelectorContainer = styled.div`
  display: flex;
`

const FormFolderSelectorButton = styled.button`
  ${secondaryButtonStyle}
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  &:first-child {
    margin-left: 0;
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
        defaultPath: getHomePath(),
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
  }, [dialogIsOpen, setValue])

  return (
    <FormFolderSelectorContainer>
      <FormFolderSelectorInput
        type='text'
        onClick={openDialog}
        readOnly
        value={
          value.trim().length === 0 ? t('folder.noLocationSelected') : value
        }
      />
      <FormFolderSelectorButton onClick={openDialog}>
        Select Folder
      </FormFolderSelectorButton>
    </FormFolderSelectorContainer>
  )
}

export default FormFolderSelector
