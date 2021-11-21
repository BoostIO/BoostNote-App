import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  UpdateSmartViewRequestBody,
  UpdateSmartViewResponseBody,
} from '../../../../api/teams/smartViews'
import { usePage } from '../../../../lib/stores/pageStore'
import { useRouter } from '../../../../lib/router'
import { SerializedSmartView } from '../../../../interfaces/db/smartView'
import SmartViewForm from './SmartViewForm'
import { getTeamLinkHref } from '../../../Link/TeamLink'
import { useCloudApi } from '../../../../lib/hooks/useCloudApi'
import { EditableQuery } from './interfaces'

interface UpdateSmartViewModalProps {
  smartView: SerializedSmartView
  showOnlyConditions?: boolean
  onUpdate?: (smartView: SerializedSmartView) => void
}

const UpdateSmartViewModal = ({
  smartView,
  showOnlyConditions,
  onUpdate,
}: UpdateSmartViewModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()

  const { updateSmartViewApi } = useCloudApi()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()

  const submit = useCallback(
    async (body: UpdateSmartViewRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)

      const res = await updateSmartViewApi(smartView, body)

      if (!res.err) {
        closeModal()
        if (onUpdate != null) {
          return onUpdate((res.data as UpdateSmartViewResponseBody).data)
        } else {
          push(
            getTeamLinkHref(team, 'dashboard', {
              smartView: (res.data as UpdateSmartViewResponseBody).data.id,
            })
          )
        }
      }
      setSending(false)
    },
    [team, smartView, updateSmartViewApi, closeModal, push, onUpdate]
  )

  if (team == null) {
    return null
  }

  return (
    <SmartViewForm
      teamId={smartView.teamId}
      action='Update'
      onCancel={closeModal}
      onSubmit={submit}
      showOnlyConditions={showOnlyConditions}
      buttonsAreDisabled={sending}
      defaultName={smartView.name}
      defaultPrivate={smartView.private}
      defaultConditions={
        Array.isArray(smartView.condition)
          ? (smartView.condition as EditableQuery)
          : []
      }
    />
  )
}

export default UpdateSmartViewModal
