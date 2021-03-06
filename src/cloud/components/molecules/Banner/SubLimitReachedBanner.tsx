import React from 'react'
import { useSettings } from '../../../lib/stores/settings'
import { usePage } from '../../../lib/stores/pageStore'
import Banner from '.'
import CustomButton from '../../atoms/buttons/CustomButton'
import styled from '../../../lib/styled'
import { freePlanDocLimit } from '../../../lib/subscription'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

const DocLimitReachedBanner = () => {
  const { subscription } = usePage()
  const { openSettingsTab } = useSettings()

  return (
    <Banner
      content={
        <p>
          <StyledLabel>
            {subscription == null
              ? `Your workspace exceeds the limit of your current plan. (${freePlanDocLimit} created documents)`
              : `Your workspace exceeds the limit of your current plan. (${subscription.seats} team members)`}
          </StyledLabel>
          <CustomButton
            style={{
              height: '28px',
              lineHeight: '10px',
              padding: '0 10px',
            }}
            variant='danger'
            onClick={() => {
              trackEvent(MixpanelActionTrackTypes.UpgradeLimit)
              openSettingsTab('teamUpgrade')
            }}
          >
            Upgrade
          </CustomButton>
        </p>
      }
      className='center'
      variant='danger'
    />
  )
}

const StyledLabel = styled.span`
  display: inline-block;
  margin-right: ${({ theme }) => theme.space.small}px;
`

export default DocLimitReachedBanner
