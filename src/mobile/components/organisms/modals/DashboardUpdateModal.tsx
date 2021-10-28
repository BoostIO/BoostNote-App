import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  UpdateDashboardRequestBody,
  UpdateDashboardResponseBody,
} from '../../../../cloud/api/teams/dashboard'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { useRouter } from '../../../../cloud/lib/router'
import { SerializedDashboard } from '../../../../cloud/interfaces/db/dashboard'
import DashboardForm from './organisms/DashboardForm'
import ModalContainer from './atoms/ModalContainer'
import { getTeamLinkHref } from '../../../../cloud/components/Link/TeamLink'
import { useCloudApi } from '../../../../cloud/lib/hooks/useCloudApi'
import { EditableQuery } from '../../../../cloud/components/Modal/contents/Dashboard/interfaces'

interface DashboardUpdateModalProps {
  dashboard: SerializedDashboard
  onUpdate?: (dashboard: SerializedDashboard) => void
}

const DashboardUpdateModal = ({
  dashboard,
  onUpdate,
}: DashboardUpdateModalProps) => {
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
    <ModalContainer title='Edit a smart folder'>
      <DashboardForm
        action='Update'
        onSubmit={submit}
        buttonsAreDisabled={sending}
        defaultName={dashboard.name}
        defaultPrivate={dashboard.private}
        defaultConditions={dashboard.condition as EditableQuery}
      />
    </ModalContainer>
  )
}

export default DashboardUpdateModal
