import { useState, useCallback } from 'react'
import { EmojiPickerContext } from './types'
import { createStoreContext } from '../../utils/context'
import {
  EmojiPickerDoc,
  EmojiPickerFolder,
} from '../../../components/organisms/Sidebar/SideNavigator/SideNavIcon'
import {
  EmojiPickerWidth,
  EmojiPickerHeight,
} from '../../../components/molecules/EmojiPicker'
import { useWindow } from '../../../../shared/lib/stores/window'

function useEmojiPickerStore(): EmojiPickerContext {
  const [closed, setClosed] = useState(true)
  const [callback, setCallback] = useState<(x?: string) => void>()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [resource, setResource] = useState<EmojiPickerFolder | EmojiPickerDoc>()
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
    (
      event: React.MouseEvent<Element>,
      resource: EmojiPickerFolder | EmojiPickerDoc
    ) => {
      setResource(resource)
      setCallback(undefined)
      setPositionRelativeToEvent(event)
      setClosed(false)
    },
    [setPositionRelativeToEvent]
  )

  const openEmojiPickerWithCallback = useCallback(
    (event: React.MouseEvent<Element>, callback: (val?: string) => void) => {
      setResource(undefined)
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
    closed,
    callback,
    position,
    resource,
    openEmojiPicker,
    openEmojiPickerWithCallback,
    closeEmojiPicker,
  }
}

export const {
  StoreProvider: EmojiPickerProvider,
  useStore: useEmojiPicker,
} = createStoreContext(useEmojiPickerStore, 'emojiPicker')
