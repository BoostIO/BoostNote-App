const longPressDelay = 350
const movementTolerance = 8

interface TouchCursorState {
  active: boolean
  startX: number
  startY: number
  timer: number
}

const getTouchDistance = (touch: Touch, state: TouchCursorState) => {
  const x = touch.clientX - state.startX
  const y = touch.clientY - state.startY

  return Math.sqrt(x * x + y * y)
}

export function attachTouchCursorDrag(editor: CodeMirror.Editor) {
  const wrapperElement = editor.getWrapperElement()
  let state: TouchCursorState | null = null

  const clearState = () => {
    if (state != null) {
      window.clearTimeout(state.timer)
      state = null
    }

    wrapperElement.classList.remove('CodeMirror-touch-cursor-dragging')
  }

  const moveCursorToTouch = (touch: Touch) => {
    const pos = editor.coordsChar({
      left: touch.pageX,
      top: touch.pageY,
    })

    editor.focus()
    editor.setCursor(pos)
    editor.scrollIntoView(pos, 30)
  }

  const onTouchStart = (event: TouchEvent) => {
    clearState()

    if (event.touches.length !== 1) {
      return
    }

    const touch = event.touches[0]

    state = {
      active: false,
      startX: touch.clientX,
      startY: touch.clientY,
      timer: window.setTimeout(() => {
        if (state == null) {
          return
        }

        state.active = true
        wrapperElement.classList.add('CodeMirror-touch-cursor-dragging')
        moveCursorToTouch(touch)
      }, longPressDelay),
    }
  }

  const onTouchMove = (event: TouchEvent) => {
    if (state == null || event.touches.length !== 1) {
      clearState()
      return
    }

    const touch = event.touches[0]

    if (!state.active) {
      if (getTouchDistance(touch, state) > movementTolerance) {
        clearState()
      }
      return
    }

    event.preventDefault()
    event.stopPropagation()
    moveCursorToTouch(touch)
  }

  const onTouchEnd = (event: TouchEvent) => {
    if (state?.active) {
      event.preventDefault()
      event.stopPropagation()
    }

    clearState()
  }

  const onContextMenu = (event: MouseEvent) => {
    if (state?.active) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  wrapperElement.addEventListener('touchstart', onTouchStart, {
    passive: true,
  })
  wrapperElement.addEventListener('touchmove', onTouchMove, {
    passive: false,
  })
  wrapperElement.addEventListener('touchend', onTouchEnd, {
    passive: false,
  })
  wrapperElement.addEventListener('touchcancel', onTouchEnd, {
    passive: false,
  })
  wrapperElement.addEventListener('contextmenu', onContextMenu)

  return () => {
    clearState()
    wrapperElement.removeEventListener('touchstart', onTouchStart)
    wrapperElement.removeEventListener('touchmove', onTouchMove)
    wrapperElement.removeEventListener('touchend', onTouchEnd)
    wrapperElement.removeEventListener('touchcancel', onTouchEnd)
    wrapperElement.removeEventListener('contextmenu', onContextMenu)
  }
}
