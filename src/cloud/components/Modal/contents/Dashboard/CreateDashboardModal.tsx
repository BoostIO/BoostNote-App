import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  createDashboard,
  CreateDashboardRequestBody,
} from '../../../../api/teams/dashboard/folders'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../../design/lib/stores/toast'
import { useRouter } from '../../../../lib/router'
import DashboardForm from './DashboardForm'
import { getTeamLinkHref } from '../../../Link/TeamLink'
import { SerializedDashboard } from '../../../../interfaces/db/dashboard'

interface CreateDashboardModalProps {
  onCreate?: (dashboard: SerializedDashboard) => void
}

const CreateDashboardModal = ({ onCreate }: CreateDashboardModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { updateDashboardsMap: updateDashboardsMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

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
    [team, onCreate, push, updateDashboardsMap, closeModal, pushApiErrorMessage]
  )

  if (team == null) {
    return null
  }

  return (
    <DashboardForm
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

export default CreateDashboardModal
