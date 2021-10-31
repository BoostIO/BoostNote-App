import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  UpdateDashboardRequestBody,
  UpdateDashboardResponseBody,
} from '../../../../api/teams/dashboard'
import { usePage } from '../../../../lib/stores/pageStore'
import { useRouter } from '../../../../lib/router'
import { SerializedDashboard } from '../../../../interfaces/db/dashboard'
import DashboardForm from './DashboardForm'
import { getTeamLinkHref } from '../../../Link/TeamLink'
import { useCloudApi } from '../../../../lib/hooks/useCloudApi'
import { EditableQuery } from './interfaces'

interface UpdateDashboardModalProps {
  dashboard: SerializedDashboard
  onUpdate?: (dashboard: SerializedDashboard) => void
}

const UpdateDashboardModal = ({
  dashboard,
  onUpdate,
}: UpdateDashboardModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()

  const { updateDashboardApi } = useCloudApi()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const submit = useCallback(
    async (body: UpdateDashboardRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)

      const res = await updateDashboardApi(dashboard, body)

      if (!res.err) {
        closeModal()
        if (onUpdate != null) {
          return onUpdate((res.data as UpdateDashboardResponseBody).data)
        } else {
          push(
            getTeamLinkHref(team, 'index', {
              dashboard: (res.data as UpdateDashboardResponseBody).data.id,
            })
          )
        }
      }
      setSending(false)
    },
    [team, dashboard, updateDashboardApi, closeModal, push, onUpdate]
  )

  if (team == null) {
    return null
  }

  return (
    <DashboardForm
      action='Update'
      onCancel={closeModal}
      onSubmit={submit}
      buttonsAreDisabled={sending}
      defaultName={dashboard.name}
      defaultPrivate={dashboard.private}
      defaultConditions={
        Array.isArray(dashboard.condition)
          ? (dashboard.condition as EditableQuery)
          : []
      }
    />
  )
}

export default UpdateDashboardModal
