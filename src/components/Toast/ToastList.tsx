import React from 'react'
import { useToast } from '../../lib/toast'
import ToastItem from './ToastItem'
import styled from 'styled-components'

const StyledToastList = styled.ul`
  position: fixed;
  display: flex;
  flex-direction: column-reverse;
  right: 0;
  bottom: 0;
`

export default () => {
  const { messages, removeMessage } = useToast()

  return (
    <StyledToastList>
      {messages.map(message => (
        <li key={message.id}>
          <ToastItem item={message} onClose={removeMessage} />
        </li>
      ))}
    </StyledToastList>
  )
}
