import { mdiOpenInNew } from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import Icon from '../../design/components/atoms/Icon'
import { ExternalLink } from '../../design/components/atoms/Link'
import styled from '../../design/lib/styled'
import { useI18n } from '../lib/hooks/useI18n'
import { lngKeys } from '../lib/i18n/types'
import { usePage } from '../lib/stores/pageStore'
import { SerializedTeam } from '../interfaces/db/team'
import { SerializedEditRequest } from '../interfaces/db/editRequest'
import useApi from '../../design/lib/hooks/useApi'
import { getUserEditRequests, sendEditRequest } from '../api/editRequests'
import { useEffectOnce } from 'react-use'
import { trackEvent } from '../api/track'
import { MixpanelActionTrackTypes } from '../interfaces/analytics/mixpanel'
import Button, { LoadingButton } from '../../design/components/atoms/Button'
import { teamIsReadonly } from '../lib/subscription'
import { useSettings } from '../lib/stores/settings'

const ViewerDisclaimer = ({
  resource = 'doc',
}: {
  resource?: 'doc' | 'folder'
}) => {
  const { team, currentUserIsCoreMember, subscription } = usePage()
  const { translate } = useI18n()
  const { openSettingsTab } = useSettings()

  const teamReadonly = useMemo(() => {
    return team != null && teamIsReadonly(team, subscription)
  }, [team, subscription])

  return (
    <>
      {!currentUserIsCoreMember && (
        <Container className='viewer__disclaimer'>
          <div className={'viewer__disclaimer__text--padding'}>
            {translate(lngKeys.ViewerDisclaimerIntro)}{' '}
            <ExternalLink
              className='viewer__disclaimer__link'
              href='https://intercom.help/boostnote-for-teams/en/articles/4354888-roles'
            >
              {translate(lngKeys.MemberRole)}
              <Icon path={mdiOpenInNew} />
            </ExternalLink>
            {resource === 'doc'
              ? translate(lngKeys.ViewerDisclaimerOutro)
              : translate(lngKeys.ViewerDisclaimerFolderOutro)}
          </div>

          {team != null && <EditRequestButton team={team} />}
        </Container>
      )}
      {teamReadonly && (
        <Container className='viewer__disclaimer'>
          <div className={'viewer__disclaimer__text--padding'}>
            Your trial has finished. Enjoying Boost Note? Upgrade now to one of
            our paid plans!
          </div>

          {team != null && (
            <Button
              className={'edit__request__button--padding'}
              variant='secondary'
              type='button'
              size='sm'
              onClick={(e) => {
                e.preventDefault()
                openSettingsTab('teamUpgrade')
              }}
            >
              {translate(lngKeys.SettingsTeamUpgrade)}
            </Button>
          )}
        </Container>
      )}
    </>
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
      className={'edit__request__button--padding'}
      variant='secondary'
      type='button'
      size='sm'
      onClick={onClick}
      disabled={fetchingRequest || sendingRequest || activeRequest != null}
      spinning={fetchingRequest || sendingRequest}
    >
      {activeRequest != null
        ? translate(lngKeys.RequestSent)
        : translate(lngKeys.RequestAskMemberRole)}
    </LoadingButton>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.colors.variants.warning.base};
  color: ${({ theme }) => theme.colors.variants.warning.text};
  border-radius: ${({ theme }) => theme.borders.radius}px;

  min-height: 36px;
  margin: ${({ theme }) => theme.sizes.spaces.md}px
    ${({ theme }) => theme.sizes.spaces.df}px;

  .viewer__disclaimer__text--padding {
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .viewer__disclaimer__link {
    font-weight: bold;
    display: inline-flex;
    color: inherit;
    align-items: center;
  }

  .edit__request__button--padding {
    margin: 6px;
    height: auto;
  }
`

export default React.memo(ViewerDisclaimer)
