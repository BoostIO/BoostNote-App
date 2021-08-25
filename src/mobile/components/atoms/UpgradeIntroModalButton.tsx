import React, { useCallback } from 'react'
import {
  MixpanelActionTrackTypes,
  MixpanelFrontEvent,
} from '../../../cloud/interfaces/analytics/mixpanel'
import { trackEvent } from '../../../cloud/api/track'
import { useModal } from '../../../design/lib/stores/modal'
import Button, { ButtonVariant } from '../../../design/components/atoms/Button'
import UpgradeIntroModal, {
  IntroPopupVariant as UpgradeIntroModalVariant,
} from '../organisms/modals/UpgradeIntroModal'

interface UpgradeIntroButtonProps {
  origin: 'share.password' | 'share.expire' | 'revision' | 'guest' | 'limit'
  variant?: ButtonVariant
  popupVariant: UpgradeIntroModalVariant
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
      openModal(<UpgradeIntroModal variant={popupVariant} />, {})
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
