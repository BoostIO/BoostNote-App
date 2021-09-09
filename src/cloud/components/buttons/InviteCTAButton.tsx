import { mdiAccountPlus } from '@mdi/js'
import React, { useCallback } from 'react'
import Button from '../../../design/components/atoms/Button'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import { usePage } from '../../lib/stores/pageStore'
import InviteMembersModal from '../Modal/InviteMembers/InviteMembersModal'

interface InviteCTAButtonProps {
  origin?: 'folder-page' | 'doc-page'
}

const InviteCTAButton = ({ origin }: InviteCTAButtonProps) => {
  const { openModal } = useModal()

  const onClick = useCallback(() => {
    openModal(<InviteMembersModal />, { showCloseIcon: true })

    switch (origin) {
      case 'folder-page':
        return trackEvent(MixpanelActionTrackTypes.InviteFromFolderPage)
      case 'doc-page':
        return trackEvent(MixpanelActionTrackTypes.InviteFromDocPage)
      default:
        return
    }
  }, [origin, openModal])

  return (
    <Button
      variant='primary'
      type='button'
      iconPath={mdiAccountPlus}
      size='sm'
      onClick={onClick}
    />
  )
}

type InviteCTAGlobalButtonProps = {
  origin?: 'folder-page' | 'doc-page'
}

const InviteCTAGlobalButton = ({ origin }: InviteCTAGlobalButtonProps) => {
  const { team } = usePage()

  if (team == null) {
    return null
  }

  return (
    <Container>
      <InviteCTAButton origin={origin} />
    </Container>
  )
}

const Container = styled.div`
  display: inline-flex;
  flex: 0 0 auto;
  margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
`

export default React.memo(InviteCTAGlobalButton)
