import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  createDashboardFolder,
  CreateDashboardFolderRequestBody,
} from '../../../../api/teams/dashboard/folders'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../../design/lib/stores/toast'
import { getDashboardFolderHref } from '../../../../lib/href'
import { useRouter } from '../../../../lib/router'
import DashboardFolderForm from './DashboardFolderForm'

const CreateDashboardFolderModal = () => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { updateDashboardFoldersMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(
    async (body: CreateDashboardFolderRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      try {
        const { dashboardFolder } = await createDashboardFolder({
          ...body,
          teamId: team.id,
        })
        updateDashboardFoldersMap([dashboardFolder.id, dashboardFolder])
        closeModal()
        push(getDashboardFolderHref(dashboardFolder, team, 'index'))
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [team, push, updateDashboardFoldersMap, closeModal, pushApiErrorMessage]
  )

  if (team == null) {
    return null
  }

  return (
    <DashboardFolderForm
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

export default CreateDashboardFolderModal
