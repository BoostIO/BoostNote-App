import { useState, useCallback } from 'react'
import { EmojiPickerContext } from './types'
import { createStoreContext } from '../../utils/context'
import { useWindow } from '../window'
import {
  EmojiPickerHeight,
  EmojiPickerWidth,
} from '../../../../components/v2/molecules/EmojiPicker'

function useEmojiPickerStore(): EmojiPickerContext {
  const [closed, setClosed] = useState(true)
  const [callback, setCallback] = useState<(x?: string) => void>()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const { windowSize } = useWindow()

  const setPositionRelativeToEvent = useCallback(
    (event: React.MouseEvent<Element>) => {
      const currentTargetRect = event.currentTarget.getBoundingClientRect()
      const xPositionLimit = windowSize.width - EmojiPickerWidth
      const clientXIsLowerThanXPositionLimit =
        currentTargetRect.left > xPositionLimit

      const yPositionLimit = windowSize.height - EmojiPickerHeight
      const clientYIsLowerThanYPositionLimit =
        currentTargetRect.top > yPositionLimit

      const position = {
        x: clientXIsLowerThanXPositionLimit
          ? xPositionLimit
          : currentTargetRect.left,
        y: clientYIsLowerThanYPositionLimit
          ? yPositionLimit
          : currentTargetRect.top,
      }
      setPosition(position)
    },
    [windowSize]
  )

  const openEmojiPicker = useCallback(
    (event: React.MouseEvent<Element>, callback: (val?: string) => void) => {
      setCallback(() => callback)
      setPositionRelativeToEvent(event)
      setClosed(false)
    },
    [setPositionRelativeToEvent]
  )

  const closeEmojiPicker = useCallback(() => {
    setClosed(true)
  }, [])

  return {
    callback,
    closed,
    position,
    openEmojiPicker,
    closeEmojiPicker,
  }
}

export const {
  StoreProvider: V2EmojiProvider,
  useStore: useEmoji,
} = createStoreContext(useEmojiPickerStore, 'emojiPicker')
