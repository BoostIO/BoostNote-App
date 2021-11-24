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

const TableViewContentManagerNewDocRow = ({
  team,
  workspaceId,
  folderId,
  className,
}: TableViewContentManagerNewFolderRowProps) => {
  const { translate } = useI18n()
  const { createDoc } = useCloudApi()
  const [formState, setFormState] = useState<'idle' | 'editing' | 'submitting'>(
    'idle'
  )
  const [newTitle, setNewTitle] = useState('')
  const compositionStateRef = useRef(false)
  const newTitleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (newTitleInputRef.current != null && formState === 'editing') {
      newTitleInputRef.current.focus()
    }
  }, [formState])

  const createNewDoc = useCallback(async () => {
    setFormState('submitting')
    if (workspaceId != null) {
      await createDoc(
        team,
        {
          title: newTitle,
          workspaceId,
          parentFolderId: folderId,
        },
        { skipRedirect: true }
      )
    }
    setNewTitle('')
    setFormState('idle')
  }, [workspaceId, folderId, createDoc, team, newTitle])

  const cancelEditing = useCallback(() => {
    setFormState('idle')
    setNewTitle('')
  }, [])

  return (
    <TableContentManagerRow className={className}>
      {formState === 'idle' ? (
        <Button
          className='content__manager--no-padding'
          variant='transparent'
          iconPath={mdiPlus}
          onClick={() => setFormState('editing')}
        >
          {translate(lngKeys.ModalsCreateNewDocument)}
        </Button>
      ) : formState === 'editing' ? (
        <FormInput
          ref={newTitleInputRef}
          value={newTitle}
          onChange={(event) => {
            setNewTitle(event.target.value)
          }}
          onCompositionStart={() => {
            compositionStateRef.current = true
          }}
          onCompositionEnd={() => {
            compositionStateRef.current = false
            if (newTitleInputRef.current != null) {
              newTitleInputRef.current.focus()
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
                createNewDoc()
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

export default TableViewContentManagerNewDocRow
