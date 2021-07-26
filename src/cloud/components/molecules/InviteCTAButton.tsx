import React from 'react'
import Button from '../../../shared/components/atoms/Button'
import { useModal } from '../../../shared/lib/stores/modal'
import styled from '../../../shared/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { usePage } from '../../lib/stores/pageStore'
import { useSettings } from '../../lib/stores/settings'

const InviteCTAButton = () => {
  const { translate } = useI18n()
  const { team } = usePage()
  const { openSettingsTab } = useSettings()
  const { closeAllModals } = useModal()

  if (team == null) {
    return null
  }

  return (
    <Container>
      <Button
        variant='primary'
        type='button'
        size='sm'
        onClick={() => {
          openSettingsTab('teamMembers')
          closeAllModals()
        }}
      >
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
