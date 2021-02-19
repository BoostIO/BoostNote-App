import React from 'react'
import { ModalContainer } from './styled'
import AppFeedbackForm from '../../../molecules/AppFeedbackForm'

const FeedbackModal = () => {
  return (
    <ModalContainer>
      <h2 style={{ margin: 0 }}>Feedback</h2>
      <AppFeedbackForm />
    </ModalContainer>
  )
}

export default FeedbackModal
