import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  createSmartFolder,
  CreateSmartFolderRequestBody,
} from '../../../../api/teams/smart-folder'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../../design/lib/stores/toast'
import { getSmartFolderHref } from '../../../../lib/href'
import { useRouter } from '../../../../lib/router'
import SmartFolderForm from './SmartFolderForm'

const CreateSmartFolderModal = () => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { updateSmartFoldersMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(
    async (body: CreateSmartFolderRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      try {
        const { smartFolder } = await createSmartFolder(team, body)
        updateSmartFoldersMap([smartFolder.id, smartFolder])
        closeModal()
        push(getSmartFolderHref(smartFolder, team, 'index'))
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [team, push, updateSmartFoldersMap, closeModal, pushApiErrorMessage]
  )

  if (team == null) {
    return null
  }

  return (
    <SmartFolderForm
      action='Create'
      onCancel={closeModal}
      onSubmit={submit}
      defaultConditionType='and'
      buttonsAreDisabled={sending}
      defaultSecondaryConditions={[
        {
          type: 'status',
          value: 'in_progress',
        },
      ]}
    />
  )
}

export default CreateSmartFolderModal
