import React, { useCallback } from 'react'
import { useSettings } from '../lib/stores/settings'
import styled from '../lib/styled'
import cc from 'classcat'
import { primaryButtonStyle } from '../lib/styled/styleFunctions'
import {
  MixpanelActionTrackTypes,
  MixpanelFrontEvent,
} from '../interfaces/analytics/mixpanel'
import { trackEvent } from '../api/track'

interface UpgradeBadgeProps {
  origin: 'share.password' | 'share.expire' | 'revision' | 'guest' | 'limit'
  variant?: 'link' | 'primary'
  label?: string
  tabIndex?: number
  query?: object
  className?: string
}

const UpgradeButton = ({
  origin,
  query,
  label = 'Upgrade',
  variant = 'primary',
  tabIndex,
  className,
}: UpgradeBadgeProps) => {
  const { openSettingsTab } = useSettings()

  const track = useCallback(async () => {
    let mixpanelEvent: MixpanelFrontEvent
    switch (origin) {
      case 'guest':
        mixpanelEvent = MixpanelActionTrackTypes.UpgradeGuest
        break
      case 'limit':
        mixpanelEvent = MixpanelActionTrackTypes.UpgradeLimit
        break
      case 'revision':
        mixpanelEvent = MixpanelActionTrackTypes.UpgradeRevision
        break
      case 'share.expire':
        mixpanelEvent = MixpanelActionTrackTypes.UpgradeExpirationDate
        break
      case 'share.password':
        mixpanelEvent = MixpanelActionTrackTypes.UpgradePassword
        break
      default:
        return
        break
    }

    return trackEvent(mixpanelEvent, query)
  }, [origin, query])

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      track()
      openSettingsTab('teamUpgrade')
    },
    [openSettingsTab, track]
  )

  return (
    <Container
      className={cc([`upgrade__${variant}`, className])}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {label}
    </Container>
  )
}

const Container = styled.button`
  all 0.3s ease-out;

  &.upgrade__primary {
    border-radius: 3px;
    ${primaryButtonStyle}
    text-transform: uppercase;
    padding: 0 5px;
    font-size: ${({ theme }) => theme.fontSizes.xxsmall}px;
    height: auto;
    line-height: 26px;
    height: 26px;
  }

  &.upgrade__link {
    outline: none;
    background: none;
    color: inherit;
    line-height: inherit;
    font-size: inherit;
    text-decoration: underline;
    margin: 0 ${({ theme }) => theme.space.xxsmall}px;

    &:hover {
      opacity: 0.8;
    }
  }
`

export default UpgradeButton
