import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  CreateDashboardRequestBody,
  CreateDashboardResponseBody,
} from '../../../../api/teams/dashboard'
import { usePage } from '../../../../lib/stores/pageStore'
import { useRouter } from '../../../../lib/router'
import DashboardForm from './DashboardForm'
import { getTeamLinkHref } from '../../../Link/TeamLink'
import { SerializedDashboard } from '../../../../interfaces/db/dashboard'
import { useCloudApi } from '../../../../lib/hooks/useCloudApi'

interface CreateDashboardModalProps {
  onCreate?: (dashboard: SerializedDashboard) => void
}

const CreateDashboardModal = ({ onCreate }: CreateDashboardModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { createDashboardApi } = useCloudApi()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const submit = useCallback(
    async (body: CreateDashboardRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      const res = await createDashboardApi(team.id, body)

      if (!res.err) {
        const { data: dashboard } = res.data as CreateDashboardResponseBody
        closeModal()
        if (onCreate != null) {
          return onCreate(res.data)
        } else {
          push(getTeamLinkHref(team, 'index', { dashboard: dashboard.id }))
        }
      }
      setSending(false)
    },
    [team, onCreate, push, closeModal, createDashboardApi]
  )

  if (team == null) {
    return null
  }

  return (
    <DashboardForm
      action='Create'
      onCancel={closeModal}
      onSubmit={submit}
      buttonsAreDisabled={sending}
      defaultConditions={[
        {
          rule: 'and',
          type: 'prop',
          value: { name: 'status', value: 'in_progress' },
        },
      ]}
    />
  )
}

export default CreateDashboardModal
