import React, { useCallback } from 'react'
import { Picker, EmojiData } from 'emoji-mart'
import styled from '../../../lib/v2/styled'
import Button from '../atoms/Button'
import { useWindow } from '../../../lib/v2/stores/window'
import { useEmoji } from '../../../lib/v2/stores/emoji'
import { useToast } from '../../../lib/v2/stores/toast'

export const EmojiPickerWidth = 350
export const EmojiPickerHeight = 380

const EmojiPicker = () => {
  const { closed, closeEmojiPicker, position, callback } = useEmoji()
  const pickerRef: React.RefObject<HTMLDivElement> = React.createRef()
  const { windowSize } = useWindow()
  const { pushApiErrorMessage } = useToast()

  const onBlurHandler = (event: any) => {
    if (
      event.relatedTarget == null ||
      pickerRef.current == null ||
      !pickerRef.current.contains(event.relatedTarget)
    ) {
      closeEmojiPicker()
      return
    }
  }

  const updateItemEmoji = useCallback(
    async (emojiId?: string) => {
      if (callback == null) {
        return
      }

      try {
        await callback(emojiId)
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [callback, pushApiErrorMessage]
  )

  const changeEmoji = useCallback(
    (emoji: EmojiData) => {
      updateItemEmoji(emoji.id)
      closeEmojiPicker()
    },
    [closeEmojiPicker, updateItemEmoji]
  )

  if (closed) return null

  return (
    <Container
      tabIndex={-1}
      ref={pickerRef}
      onBlur={onBlurHandler}
      style={{
        left:
          position.x + EmojiPickerWidth < windowSize.width
            ? position.x
            : windowSize.width - EmojiPickerWidth,
        top:
          position.y + EmojiPickerHeight < windowSize.height
            ? position.y
            : windowSize.height - EmojiPickerHeight,
      }}
    >
      <Picker
        set='apple'
        onSelect={changeEmoji}
        showPreview={false}
        showSkinTones={false}
        title=''
        autoFocus={true}
        color={'currentColor'}
        sheetSize={32}
      />
      <Button
        variant='secondary'
        onClick={() => {
          updateItemEmoji()
          closeEmojiPicker()
        }}
      >
        clear
      </Button>
    </Container>
  )
}

const Container = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: 8002;
  padding: 0;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  outline: none;
  width: auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background.main};

  .emoji-mart {
    background-color: ${({ theme }) => theme.colors.background.main};
    border-color: ${({ theme }) => theme.colors.border.main};
    color: ${({ theme }) => theme.colors.text.main};

    .emoji-mart-category-label span {
      background-color: ${({ theme }) => theme.colors.background.main};
    }

    .emoji-mart-bar {
      border-color: ${({ theme }) => theme.colors.border.main};
    }

    input {
      background-color: ${({ theme }) =>
        theme.colors.background.gradients.first};
      color: ${({ theme }) => theme.colors.text.second};
      border-color: ${({ theme }) => theme.colors.border.main};
      margin-bottom: 5px;

      &:focus {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focus};
      }
    }
  }
`

export default EmojiPicker
