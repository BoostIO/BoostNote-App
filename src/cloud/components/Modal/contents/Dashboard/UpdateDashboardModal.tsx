import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  updateDashboard,
  UpdateDashboardRequestBody,
} from '../../../../api/teams/dashboard/folders'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../../design/lib/stores/toast'
import { getDashboardHref } from '../../../../lib/href'
import { useRouter } from '../../../../lib/router'
import { SerializedDashboard } from '../../../../interfaces/db/dashboard'
import DashboardForm from './DashboardForm'

interface UpdateDashboardModalProps {
  dashboard: SerializedDashboard
}

const UpdateDashboardModal = ({ dashboard }: UpdateDashboardModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()

  const { updateDashboardsMap: updateDashboardsMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(
    async (body: UpdateDashboardRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      try {
        const { data: updatedDashboard } = await updateDashboard(
          dashboard,
          body
        )
        updateDashboardsMap([dashboard.id, updatedDashboard])
        closeModal()
        push(getDashboardHref(dashboard, team, 'index'))
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [
      team,
      dashboard,
      updateDashboardsMap,
      closeModal,
      push,
      pushApiErrorMessage,
    ]
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
  )
}

export default UpdateDashboardModal
