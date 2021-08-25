import React, { useMemo } from 'react'
import { StyledContextMenuBackground } from './styled'

interface ControlsContextMenuBackgroundProps {
  closeContextMenu: () => void
}

const ControlsContextMenuBackground = ({
  closeContextMenu,
}: ControlsContextMenuBackgroundProps) => {
  const backgroundClickHandler = useMemo(() => {
    return (event: MouseEvent) => {
      event.preventDefault()
      closeContextMenu()
    }
  }, [closeContextMenu])

  return <StyledContextMenuBackground onClick={backgroundClickHandler} />
}

export default ControlsContextMenuBackground
