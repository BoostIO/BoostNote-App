import React, { useCallback } from 'react'
import Button from '../../../shared/components/atoms/Button'
import { useModal } from '../../../shared/lib/stores/modal'
import styled from '../../../shared/lib/styled'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { usePage } from '../../lib/stores/pageStore'
import { useSettings } from '../../lib/stores/settings'

interface InviteCTAButtonProps {
  origin?: 'folder-page' | 'doc-page'
}

const InviteCTAButton = ({ origin }: InviteCTAButtonProps) => {
  const { translate } = useI18n()
  const { team } = usePage()
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

  if (team == null) {
    return null
  }

  return (
    <Container>
      <Button variant='primary' type='button' size='sm' onClick={onClick}>
        {translate(lngKeys.GeneralInvite)}
      </Button>
    </Container>
  )
}

const Container = styled.div`
  display: inline-flex;
  flex: 0 0 auto;
  margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
`

export default React.memo(InviteCTAButton)
