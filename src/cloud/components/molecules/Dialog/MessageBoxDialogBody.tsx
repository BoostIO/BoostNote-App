import React, { useRef } from 'react'
import { MessageBoxDialogData } from '../../../lib/stores/dialog/types'
import {
  StyledDialogBody,
  StyledDialogTitle,
  StyledDialogMessage,
  StyledDialogButtonGroup,
  StyledDialogButton,
} from './styled'
import { useEffectOnce } from 'react-use'
import { preventKeyboardEventPropagation } from '../../../lib/keyboard'

type MessageBoxDialogProps = {
  data: MessageBoxDialogData
  closeDialog: () => void
}

const MessageBoxDialogBody = ({ data, closeDialog }: MessageBoxDialogProps) => {
  const buttonRefs = useRef<HTMLButtonElement[]>([])
  const currentIndex = useRef<number>(0)

  useEffectOnce(() => {
    const { defaultButtonIndex = 0 } = data
    if (buttonRefs.current[defaultButtonIndex] != null) {
      currentIndex.current = defaultButtonIndex
      buttonRefs.current[defaultButtonIndex].focus()
    }
  })

  const handleBodyKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'escape':
        if (data.cancelButtonIndex != null) {
          closeDialog()
          data.onClose(data.cancelButtonIndex)
        }
        break
      case 'arrowleft': {
        preventKeyboardEventPropagation(event)
        const nextIndex = currentIndex.current + 1
        if (buttonRefs.current[nextIndex] == null) {
          return
        }
        currentIndex.current = nextIndex
        buttonRefs.current[nextIndex].focus()
        break
      }
      case 'arrowright': {
        preventKeyboardEventPropagation(event)
        if (currentIndex.current === 0) {
          return
        }
        const nextIndex = currentIndex.current - 1
        if (buttonRefs.current[nextIndex] == null) {
          return
        }
        currentIndex.current = nextIndex
        buttonRefs.current[nextIndex].focus()
        break
      }
      case 'enter':
        closeDialog()
        preventKeyboardEventPropagation(event)
        data.onClose(currentIndex.current)
        break
      default:
        return
    }
  }

  const close = (value: number) => {
    closeDialog()
    data.onClose(value)
  }

  const { title, message, buttons } = data

  return (
    <StyledDialogBody onKeyDown={handleBodyKeyDown}>
      <StyledDialogTitle>{title}</StyledDialogTitle>
      <StyledDialogMessage>{message}</StyledDialogMessage>
      <StyledDialogButtonGroup>
        {buttons.map((button, index) => {
          if (typeof button === 'string') {
            return (
              <StyledDialogButton
                key={`${data.id}-${index}`}
                onClick={() => close(index)}
                ref={(el: any) => (buttonRefs.current[index] = el)}
              >
                {button}
              </StyledDialogButton>
            )
          }

          return (
            <StyledDialogButton
              key={`${data.id}-${index}`}
              onClick={() => close(index)}
              ref={(el: any) => (buttonRefs.current[index] = el)}
              style={button.style}
              className={button.className}
            >
              {button.label}
            </StyledDialogButton>
          )
        })}
      </StyledDialogButtonGroup>
    </StyledDialogBody>
  )
}

export default MessageBoxDialogBody
