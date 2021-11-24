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
  const [newFolderRowState, setNewFolderRowState] = useState<
    'idle' | 'editing' | 'submitting'
  >('idle')

  const { translate } = useI18n()
  const { createFolder } = useCloudApi()
  const [newFolderName, setNewFolderName] = useState('')
  const compositionStateRef = useRef(false)
  const newFolderInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (newFolderInputRef.current != null && newFolderRowState === 'editing') {
      newFolderInputRef.current.focus()
    }
  }, [newFolderRowState])

  const createNewFolder = useCallback(async () => {
    setNewFolderRowState('submitting')
    if (workspaceId != null) {
      await createFolder(
        team,
        {
          folderName: newFolderName,
          description: '',
          workspaceId: workspaceId,
          parentFolderId: folderId,
        },
        { skipRedirect: true }
      )
    }
    setNewFolderName('')
    setNewFolderRowState('idle')
  }, [workspaceId, folderId, createFolder, team, newFolderName])

  const cancelEditing = useCallback(() => {
    setNewFolderRowState('idle')
    setNewFolderName('')
  }, [])

  return (
    <TableContentManagerRow className={className}>
      {newFolderRowState === 'idle' ? (
        <Button
          className='content__manager--no-padding'
          onClick={() => {
            setNewFolderRowState('editing')
          }}
          variant='transparent'
          iconPath={mdiPlus}
        >
          {translate(lngKeys.ModalsCreateNewFolder)}
        </Button>
      ) : newFolderRowState === 'editing' ? (
        <FormInput
          ref={newFolderInputRef}
          value={newFolderName}
          onChange={(event) => {
            setNewFolderName(event.target.value)
          }}
          onCompositionStart={() => {
            compositionStateRef.current = true
          }}
          onCompositionEnd={() => {
            compositionStateRef.current = false
            if (newFolderInputRef.current != null) {
              newFolderInputRef.current.focus()
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
          onBlur={() => {
            cancelEditing()
          }}
        />
      ) : (
        <Spinner />
      )}
    </TableContentManagerRow>
  )
}

export default TableViewContentManagerNewFolderRow
