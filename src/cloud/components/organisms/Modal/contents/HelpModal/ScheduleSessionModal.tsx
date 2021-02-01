import React from 'react'
import { useEffectOnce } from 'react-use'
import { useToast } from '../../../../../lib/stores/toast'
import { ModalContainer, SectionHeader2 } from '../styled'

const ScheduleSessionModal = () => {
  const { pushMessage } = useToast()

  useEffectOnce(() => {
    if (Calendly == null) {
      pushMessage({
        title: 'Error',
        description: `Error while opening the scheduling popup`,
      })
      return
    }
    Calendly.initInlineWidget({
      url: 'https://calendly.com/boosthub/support',
      parentElement: document.getElementById('schedule-modal-calendly'),
      prefill: {},
      utm: {},
    })
  })

  return (
    <ModalContainer>
      <SectionHeader2>Schedule a video session</SectionHeader2>
      <p>
        Feel free to book a video session for how to use Boost Note for Teams.
      </p>
      <div
        id='schedule-modal-calendly'
        className='calendly-inline-widget'
        style={{ minWidth: 320, height: 580 }}
        data-auto-load='false'
      />
    </ModalContainer>
  )
}

export default ScheduleSessionModal
