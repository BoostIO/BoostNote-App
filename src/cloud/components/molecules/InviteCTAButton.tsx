import React, { useCallback, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button, { LoadingButton } from '../../../shared/components/atoms/Button'
import useApi from '../../../shared/lib/hooks/useApi'
import { useModal } from '../../../shared/lib/stores/modal'
import styled from '../../../shared/lib/styled'
import { getUserEditRequests, sendEditRequest } from '../../api/editRequests'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { SerializedEditRequest } from '../../interfaces/db/editRequest'
import { SerializedTeam } from '../../interfaces/db/team'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { usePage } from '../../lib/stores/pageStore'
import { useSettings } from '../../lib/stores/settings'

interface InviteCTAButtonProps {
  origin?: 'folder-page' | 'doc-page'
}

const InviteCTAButton = ({ origin }: InviteCTAButtonProps) => {
  const { translate } = useI18n()
  const { openSettingsTab } = useSettings()
  const { closeAllModals } = useModal()

  const onClick = useCallback(() => {
    openSettingsTab('teamMembers')
    closeAllModals()

    switch (origin) {
      case 'folder-page':
        return trackEvent(MixpanelActionTrackTypes.InviteFromFolderPage)
      case 'doc-page':
        return trackEvent(MixpanelActionTrackTypes.InviteFromDocPage)
      default:
        return
    }
  }, [origin, openSettingsTab, closeAllModals])

  return (
    <Button variant='primary' type='button' size='sm' onClick={onClick}>
      {translate(lngKeys.GeneralInvite)}
    </Button>
  )
}

const EditRequestButton = ({ team }: { team: SerializedTeam }) => {
  const { translate } = useI18n()
  const [activeRequest, setActiveRequest] = useState<SerializedEditRequest>()

  const { submit: getEditRequest, sending: fetchingRequest } = useApi({
    api: (teamId: string) => getUserEditRequests(teamId),
    cb: ({ editRequests }) => {
      if (editRequests.length > 0) {
        setActiveRequest(editRequests[0])
      }
    },
  })

  const { submit: createEditRequest, sending: sendingRequest } = useApi({
    api: (teamId: string) => sendEditRequest(teamId),
    cb: ({ editRequest }) => {
      setActiveRequest(editRequest)
    },
  })

  useEffectOnce(() => {
    getEditRequest(team.id)
  })

  const onClick = useCallback(() => {
    if (activeRequest != null) {
      return
    }
    createEditRequest(team.id)
    trackEvent(MixpanelActionTrackTypes.SendEditRequest)
  }, [activeRequest, createEditRequest, team.id])

  return (
    <LoadingButton
      variant='secondary'
      type='button'
      size='sm'
      onClick={onClick}
      disabled={fetchingRequest || sendingRequest || activeRequest != null}
      spinning={fetchingRequest || sendingRequest}
    >
      {activeRequest != null
        ? translate(lngKeys.RequestSent)
        : translate(lngKeys.RequestAsk)}
    </LoadingButton>
  )
}

type InviteCTAGlobalButtonProps = {
  origin?: 'folder-page' | 'doc-page'
}

const InviteCTAGlobalButton = ({ origin }: InviteCTAGlobalButtonProps) => {
  const { team, currentUserIsCoreMember } = usePage()

  if (team == null) {
    return null
  }

  return (
    <Container>
      {currentUserIsCoreMember ? (
        <InviteCTAButton origin={origin} />
      ) : (
        <EditRequestButton team={team} />
      )}
    </Container>
  )
}

const Container = styled.div`
  display: inline-flex;
  flex: 0 0 auto;
  margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
`

export default React.memo(InviteCTAGlobalButton)
