import React, { useCallback } from 'react'
import {
  MixpanelActionTrackTypes,
  MixpanelFrontEvent,
} from '../interfaces/analytics/mixpanel'
import { trackEvent } from '../api/track'
import { useModal } from '../../shared/lib/stores/modal'
import Button, { ButtonVariant } from '../../shared/components/atoms/Button'
import IntroPopup, { IntroPopupVariant } from './organisms/IntroPopup'

interface UpgradeIntroButtonProps {
  origin: 'share.password' | 'share.expire' | 'revision' | 'guest' | 'limit'
  variant?: ButtonVariant
  popupVariant: IntroPopupVariant
  label?: string
  tabIndex?: number
  query?: object
  className?: string
}

const UpgradeIntroButton = ({
  origin,
  query,
  label = 'Upgrade',
  variant = 'primary',
  tabIndex,
  className,
  popupVariant,
}: UpgradeIntroButtonProps) => {
  const { openModal } = useModal()

  const track = useCallback(async () => {
    let mixpanelEvent: MixpanelFrontEvent
    switch (origin) {
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
      openModal(<IntroPopup variant={popupVariant} />, { width: 'small' })
    },
    [openModal, popupVariant, track]
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

export default UpgradeIntroButton
