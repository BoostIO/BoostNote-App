import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  createDashboard,
  CreateDashboardRequestBody,
} from '../../../../cloud/api/teams/dashboard/folders'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { useToast } from '../../../../design/lib/stores/toast'
import { useRouter } from '../../../../cloud/lib/router'
import ModalContainer from './atoms/ModalContainer'
import DashboardForm from './organisms/DashboardForm'
import { useAppStatus } from '../../../lib/appStatus'
import { getTeamLinkHref } from '../../../../cloud/components/Link/TeamLink'
import { SerializedDashboard } from '../../../../cloud/interfaces/db/dashboard'

interface CreateDashboardModalProps {
  onCreate?: (dashboard: SerializedDashboard) => void
}

const DashboardCreateModal = ({ onCreate }: CreateDashboardModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { updateDashboardsMap: updateDashboardsMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()
  const { setShowingNavigator } = useAppStatus()

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(
    async (body: CreateDashboardRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      try {
        const { data: dashboardFolder } = await createDashboard({
          ...body,
          teamId: team.id,
        })
        updateDashboardsMap([dashboardFolder.id, dashboardFolder])
        closeModal()
        setShowingNavigator(false)
        if (onCreate != null) {
          return onCreate(dashboardFolder)
        } else {
          push(
            getTeamLinkHref(team, 'index', { dashboard: dashboardFolder.id })
          )
        }
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [
      team,
      push,
      updateDashboardsMap,
      closeModal,
      pushApiErrorMessage,
      setShowingNavigator,
      onCreate,
    ]
  )

  if (team == null) {
    return null
  }

  return (
    <ModalContainer title='Create a smart folder'>
      <DashboardForm
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

export default DashboardCreateModal
