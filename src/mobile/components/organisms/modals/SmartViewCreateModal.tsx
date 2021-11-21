import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import {
  createSmartView,
  CreateSmartViewRequestBody,
} from '../../../../cloud/api/teams/smartViews'
import { usePage } from '../../../../cloud/lib/stores/pageStore'
import { useNav } from '../../../../cloud/lib/stores/nav'
import { useToast } from '../../../../design/lib/stores/toast'
import { useRouter } from '../../../../cloud/lib/router'
import ModalContainer from './atoms/ModalContainer'
import SmartViewForm from './organisms/SmartViewForm'
import { useAppStatus } from '../../../lib/appStatus'
import { getTeamLinkHref } from '../../../../cloud/components/Link/TeamLink'
import { SerializedSmartView } from '../../../../cloud/interfaces/db/smartView'

interface CreateSmartViewModalProps {
  onCreate?: (smartView: SerializedSmartView) => void
}

const SmartViewCreateModal = ({ onCreate }: CreateSmartViewModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { updateSmartViewsMap: updateSmartViewsMap } = useNav()
  const [sending, setSending] = useState(false)
  const { push } = useRouter()
  const { setShowingNavigator } = useAppStatus()

  const { pushApiErrorMessage } = useToast()
  const submit = useCallback(
    async (body: CreateSmartViewRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      try {
        const { data: smartViewFolder } = await createSmartView({
          ...body,
          teamId: team.id,
        })
        updateSmartViewsMap([smartViewFolder.id, smartViewFolder])
        closeModal()
        setShowingNavigator(false)
        if (onCreate != null) {
          return onCreate(smartViewFolder)
        } else {
          push(
            getTeamLinkHref(team, 'dashboard', {
              smartView: smartViewFolder.id,
            })
          )
        }
      } catch (error) {
        console.error(error)
        pushApiErrorMessage(error)
        setSending(false)
      }
    },
    [
      team,
      push,
      updateSmartViewsMap,
      closeModal,
      pushApiErrorMessage,
      setShowingNavigator,
      onCreate,
    ]
  )

  if (team == null) {
    return null
  }

  return (
    <ModalContainer title='Create a SmartView'>
      <SmartViewForm
        teamId={team.id}
        action='Create'
        onSubmit={submit}
        buttonsAreDisabled={sending}
        defaultConditions={[]}
      />
    </ModalContainer>
  )
}

export default SmartViewCreateModal
