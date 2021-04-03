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

const FoldingWrapper: React.FC<{ folding: FoldingProps; focused: boolean }> = ({
  focused,
  folding,
  children,
}) => {
  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused) {
        return
      }

      if (isSingleKeyEvent(event, 'arrowright')) {
        preventKeyboardEventPropagation(event)
        folding.unfold()
        return
      }

      if (isSingleKeyEvent(event, 'arrowleft')) {
        preventKeyboardEventPropagation(event)
        folding.fold()
        return
      }
    },
    [folding, focused]
  )
  useGlobalKeyDownHandler(keyDownHandler)

  return <>{children}</>
}

export default FoldingWrapper
