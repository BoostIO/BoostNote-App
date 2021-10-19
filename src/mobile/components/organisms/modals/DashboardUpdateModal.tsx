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
        defaultConditionType={dashboard.condition.type}
        defaultSecondaryConditions={dashboard.condition.conditions.map(
          (secondaryCondition) => {
            switch (secondaryCondition.type) {
              case 'due_date':
              case 'creation_date':
              case 'update_date':
                switch (secondaryCondition.value.type) {
                  case '30_days':
                  case '7_days':
                  case 'today':
                    return {
                      type: secondaryCondition.type,
                      value: {
                        type: secondaryCondition.value.type,
                      },
                    }
                  case 'before':
                  case 'after':
                  case 'specific':
                    return {
                      type: secondaryCondition.type,
                      value: {
                        type: secondaryCondition.value.type,
                        date: new Date(secondaryCondition.value.date),
                      },
                    }
                  case 'between':
                    return {
                      type: secondaryCondition.type,
                      value: {
                        type: secondaryCondition.value.type,
                        from: new Date(secondaryCondition.value.from),
                        to: new Date(secondaryCondition.value.to),
                      },
                    }
                }
            }
            return secondaryCondition
          }
        )}
      />
    </ModalContainer>
  )
}

export default DashboardUpdateModal
