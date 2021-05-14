import React, { useCallback } from 'react'
import { useSettings } from '../lib/stores/settings'
import {
  MixpanelActionTrackTypes,
  MixpanelFrontEvent,
} from '../interfaces/analytics/mixpanel'
import { trackEvent } from '../api/track'
import Button, { ButtonVariant } from '../../shared/components/atoms/Button'

interface UpgradeBadgeProps {
  origin: 'share.password' | 'share.expire' | 'revision' | 'guest' | 'limit'
  variant?: ButtonVariant
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
    <Button
      variant={variant}
      onClick={onClick}
      tabIndex={tabIndex}
      className={className}
      size='sm'
    >
      {label}
    </Button>
  )
}

export default UpgradeButton
