import React from 'react'
import { SectionHeader } from './styled'
import Button from '../../shared/components/atoms/Button'
import { openNew } from '../../lib/platform'

const SponsorTab = () => {
  return (
    <div>
      <SectionHeader>Please support our open source activity</SectionHeader>
      <p>
        We need your support to maintain Boost Note app sustainably. Thanks for
        helping us!
      </p>
      <div>
        <Button
          onClick={() => openNew('https://buy.stripe.com/fZe01ZauD6M13U4fYY')}
        >
          $30 / One Time
        </Button>
        <Button
          onClick={() => openNew('https://buy.stripe.com/14k1630U3eet62caEF')}
        >
          $50 / One Time
        </Button>
      </div>
    </div>
  )
}

export default SponsorTab
