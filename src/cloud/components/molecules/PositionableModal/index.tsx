import React, { useCallback } from 'react'
import styled from '../../../lib/styled'

interface PositionableModalProps {
  children?: React.ReactNode
  position?: { top: number; left: number }
  close: () => void
}

const PositionableModal = ({
  children,
  position,
  close,
}: PositionableModalProps) => {
  const style =
    position != null
      ? { top: position.top, left: position.left }
      : { top: '50%', left: '50%', transform: 'translate3d(50%, 50%, 0)' }

  const closeCallback = useCallback(
    (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      close()
    },
    [close]
  )

  return (
    <StyledModalFrame onClick={closeCallback}>
      <StyledModalContent style={style}>{children}</StyledModalContent>
    </StyledModalFrame>
  )
}

export default PositionableModal

const StyledModalFrame = styled.div`
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0px;
  left: 0px;
  z-index: 999;
`

const StyledModalContent = styled.div`
  position: absolute;
`
