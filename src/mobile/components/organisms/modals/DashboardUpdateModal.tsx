import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  updateDashboard,
  UpdateDashboardRequestBody,
} from '../../../../cloud/api/teams/dashboard/folders'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { useToast } from '../../../../design/lib/stores/toast'
import { getDashboardHref } from '../../../../cloud/lib/href'
import { useRouter } from '../../../../cloud/lib/router'
import { SerializedDashboard } from '../../../../cloud/interfaces/db/dashboard'
import DashboardForm from './organisms/DashboardForm'
import ModalContainer from './atoms/ModalContainer'

interface DashboardUpdateModalProps {
  dashboardFolder: SerializedDashboard
}

const DashboardUpdateModal = ({
  dashboardFolder,
}: DashboardUpdateModalProps) => {
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
          dashboardFolder,
          body
        )
        updateDashboardsMap([dashboardFolder.id, updatedDashboard])
        closeModal()
        push(getDashboardHref(dashboardFolder, team, 'index'))
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [
      team,
      dashboardFolder,
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
    <ModalContainer title='Edit a smart folder'>
      <DashboardForm
        action='Update'
        onSubmit={submit}
        buttonsAreDisabled={sending}
        defaultName={dashboardFolder.name}
        defaultPrivate={dashboardFolder.private}
        defaultConditionType={dashboardFolder.condition.type}
        defaultSecondaryConditions={dashboardFolder.condition.conditions.map(
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
