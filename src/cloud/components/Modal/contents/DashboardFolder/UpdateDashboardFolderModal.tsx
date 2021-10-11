import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  updateDashboardFolder,
  UpdateDashboardFolderRequestBody,
} from '../../../../api/teams/dashboard/folders'
import { usePage } from '../../../../lib/stores/pageStore'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../../design/lib/stores/toast'
import { getDashboardFolderHref } from '../../../../lib/href'
import { useRouter } from '../../../../lib/router'
import { SerializedDashboardFolder } from '../../../../interfaces/db/dashboardFolder'
import DashboardFolderForm from './DashboardFolderForm'

interface UpdateDashboardFolderModalProps {
  dashboardFolder: SerializedDashboardFolder
}

const UpdateDashboardFolderModal = ({
  dashboardFolder,
}: UpdateDashboardFolderModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()

  const { updateDashboardFoldersMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(
    async (body: UpdateDashboardFolderRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      try {
        const {
          dashboardFolder: updatedDashboardFolder,
        } = await updateDashboardFolder(dashboardFolder, body)
        updateDashboardFoldersMap([dashboardFolder.id, updatedDashboardFolder])
        closeModal()
        push(getDashboardFolderHref(dashboardFolder, team, 'index'))
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [
      team,
      dashboardFolder,
      updateDashboardFoldersMap,
      closeModal,
      push,
      pushApiErrorMessage,
    ]
  )

  if (team == null) {
    return null
  }

  return (
    <DashboardFolderForm
      action='Update'
      onCancel={closeModal}
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
  )
}

export default UpdateDashboardFolderModal
