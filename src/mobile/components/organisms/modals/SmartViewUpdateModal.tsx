import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  UpdateSmartViewRequestBody,
  UpdateSmartViewResponseBody,
} from '../../../../cloud/api/teams/smartViews'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { useRouter } from '../../../../cloud/lib/router'
import { SerializedSmartView } from '../../../../cloud/interfaces/db/smartView'
import SmartViewForm from './organisms/SmartViewForm'
import ModalContainer from './atoms/ModalContainer'
import { getTeamLinkHref } from '../../../../cloud/components/Link/TeamLink'
import { useCloudApi } from '../../../../cloud/lib/hooks/useCloudApi'
import { EditableQuery } from '../../../../cloud/components/Modal/contents/SmartView/interfaces'

interface SmartViewUpdateModalProps {
  smartView: SerializedSmartView
  onUpdate?: (smartView: SerializedSmartView) => void
}

const SmartViewUpdateModal = ({
  smartView,
  onUpdate,
}: SmartViewUpdateModalProps) => {
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
    <ModalContainer title='Edit a SmartView'>
      <SmartViewForm
        teamId={smartView.teamId}
        action='Update'
        onSubmit={submit}
        buttonsAreDisabled={sending}
        defaultName={smartView.name}
        defaultPrivate={smartView.private}
        defaultConditions={
          Array.isArray(smartView.condition)
            ? (smartView.condition as EditableQuery)
            : []
        }
      />
    </ModalContainer>
  )
}

export default SmartViewUpdateModal
