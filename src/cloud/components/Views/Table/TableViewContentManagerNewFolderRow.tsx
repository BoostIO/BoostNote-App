import React, { useState, useRef, useEffect, useCallback } from 'react'
import { mdiPlus } from '@mdi/js'
import Button from '../../../../design/components/atoms/Button'
import TableContentManagerRow from './TableContentManagerRow'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { SerializedTeam } from '../../../interfaces/db/team'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import Spinner from '../../../../design/components/atoms/Spinner'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'

interface TableViewContentManagerNewFolderRowProps {
  team: SerializedTeam
  workspaceId: string
  folderId?: string
  className?: string
}

const TableViewContentManagerNewFolderRow = ({
  team,
  workspaceId,
  folderId,
  className,
}: TableViewContentManagerNewFolderRowProps) => {
  const [formState, setFormState] = useState<'idle' | 'editing' | 'submitting'>(
    'idle'
  )

  const { translate } = useI18n()
  const { createFolder } = useCloudApi()
  const [newName, setNewName] = useState('')
  const compositionStateRef = useRef(false)
  const newNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (newNameInputRef.current != null && formState === 'editing') {
      newNameInputRef.current.focus()
    }
  }, [formState])

  const createNewFolder = useCallback(async () => {
    setFormState('submitting')
    if (workspaceId != null) {
      await createFolder(
        team,
        {
          folderName: newName,
          description: '',
          workspaceId: workspaceId,
          parentFolderId: folderId,
        },
        { skipRedirect: true }
      )
    }
    setNewName('')
    setFormState('idle')
  }, [workspaceId, folderId, createFolder, team, newName])

  const cancelEditing = useCallback(() => {
    setFormState('idle')
    setNewName('')
  }, [])

  return (
    <TableContentManagerRow className={className}>
      {formState === 'idle' ? (
        <Button
          className='content__manager--no-padding'
          onClick={() => {
            setFormState('editing')
          }}
          variant='transparent'
          iconPath={mdiPlus}
        >
          {translate(lngKeys.ModalsCreateNewFolder)}
        </Button>
      ) : formState === 'editing' ? (
        <FormInput
          ref={newNameInputRef}
          value={newName}
          onChange={(event) => {
            setNewName(event.target.value)
          }}
          onCompositionStart={() => {
            compositionStateRef.current = true
          }}
          onCompositionEnd={() => {
            compositionStateRef.current = false
            if (newNameInputRef.current != null) {
              newNameInputRef.current.focus()
            }
          }}
          onKeyPress={(event) => {
            if (compositionStateRef.current) {
              return
            }
            switch (event.key) {
              case 'Escape':
                event.preventDefault()
                cancelEditing()
                return
              case 'Enter':
                event.preventDefault()
                createNewFolder()
                return
            }
          }}
          onBlur={cancelEditing}
        />
      ) : (
        <Spinner />
      )}
    </TableContentManagerRow>
  )
}

export default TableViewContentManagerNewFolderRow
