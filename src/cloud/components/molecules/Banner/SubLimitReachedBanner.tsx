import React from 'react'
import { useSettings } from '../../../lib/stores/settings'
import { usePage } from '../../../lib/stores/pageStore'
import { freePlanDocLimit } from '../../../lib/subscription'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import Banner from '../../../../shared/components/atoms/Banner'
import Button from '../../../../shared/components/atoms/Button'
import styled from '../../../../shared/lib/styled'

const DocLimitReachedBanner = () => {
  const { subscription, currentUserIsCoreMember } = usePage()
  const { openSettingsTab } = useSettings()

  if (!currentUserIsCoreMember) {
    return (
      <Container className='doc__edit__limit'>
        <Banner variant='warning' className='doc__edit__limit'>
          Only members can edit documents. Viewers can add comments, or see
          updates in realtime. Consider asking your team to get promoted and
          participate as well.
        </Banner>
      </Container>
    )
  }

  return (
    <Container className='doc__edit__limit'>
      <Banner variant='warning' className='doc__edit__limit'>
        <span className='limit__reached__banner__label'>
          {subscription == null
            ? `Your workspace exceeds the limit of your current plan. (${freePlanDocLimit} created documents)`
            : `Your workspace exceeds the limit of your current plan. (${subscription.seats} team members)`}
        </span>
        <Button
          variant='primary'
          className='limit__reached__banner__button'
          onClick={() => {
            trackEvent(MixpanelActionTrackTypes.UpgradeLimit)
            openSettingsTab('teamUpgrade')
          }}
        >
          Upgrade
        </Button>
      </Banner>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  .doc__edit__limit {
    width: 100%;

    .banner__content {
      width: 100%;
      text-align: center;
    }
  }

  .limit__reached__banner__label {
    display: inline-block;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .limit__reached__banner__button {
    flex: 0 0 auto;
  }
`

export default DocLimitReachedBanner
