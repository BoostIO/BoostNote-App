import React, { useCallback } from 'react'

import {
  isSingleKeyEvent,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../lib/v2/keyboard'

export type FoldingProps = {
  fold: () => void
  unfold: () => void
  toggle: () => void
}

const FoldingWrapper: React.FC<
  { focused: boolean } & { fold: () => void; unfold: () => void }
> = ({ focused, fold, unfold, children }) => {
  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused) {
        return
      }

      if (isSingleKeyEvent(event, 'arrowright')) {
        preventKeyboardEventPropagation(event)
        unfold()
        return
      }

      if (isSingleKeyEvent(event, 'arrowleft')) {
        preventKeyboardEventPropagation(event)
        fold()
        return
      }
    },
    [fold, unfold, focused]
  )
  useGlobalKeyDownHandler(keyDownHandler)

  return <>{children}</>
}

export default FoldingWrapper
