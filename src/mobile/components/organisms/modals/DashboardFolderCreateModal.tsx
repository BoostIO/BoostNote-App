import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  createDashboardFolder,
  CreateDashboardFolderRequestBody,
} from '../../../../cloud/api/teams/dashboard/folders'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { useToast } from '../../../../design/lib/stores/toast'
import { getDashboardFolderHref } from '../../../../cloud/lib/href'
import { useRouter } from '../../../../cloud/lib/router'
import ModalContainer from './atoms/ModalContainer'
import DashboardFolderForm from './organisms/DashboardFolderForm'
import { useAppStatus } from '../../../lib/appStatus'

const DashboardFolderCreateModal = () => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { updateDashboardFoldersMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()
  const { setShowingNavigator } = useAppStatus()

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
        setShowingNavigator(false)
        push(getDashboardFolderHref(dashboardFolder, team, 'index'))
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [
      team,
      push,
      updateDashboardFoldersMap,
      closeModal,
      pushApiErrorMessage,
      setShowingNavigator,
    ]
  )

  if (team == null) {
    return null
  }

  return (
    <ModalContainer title='Create a smart folder'>
      <DashboardFolderForm
        action='Create'
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
    </ModalContainer>
  )
}

export default DashboardFolderCreateModal
