import React, { useEffect } from 'react'
import {
  StyledRelativeDialog,
  StyledWrapper,
  StyledRelativeWrapper,
  StyledFixedBackground,
} from './styled'
import { focusFirstChildFromElement } from '../../../lib/dom'

interface RelativeDialogProps {
  closed: boolean
  setClosed: (val: boolean) => void
}

const RelativeDialog = ({
  children,
  closed,
  setClosed,
}: React.PropsWithChildren<RelativeDialogProps>) => {
  const dialogRef: React.RefObject<HTMLDivElement> = React.createRef()

  useEffect(() => {
    if (!closed) {
      focusFirstChildFromElement(dialogRef.current)
    }
  }, [closed, dialogRef])

  const closeDialogIfBlurred = (event: React.FocusEvent<HTMLDivElement>) => {
    if (isBlurred(event.relatedTarget)) {
      setClosed(true)
    }
  }

  const isBlurred = (relatedTarget: any): boolean => {
    if (dialogRef.current == null) return true
    let currentTarget: HTMLElement | null | undefined = relatedTarget
    while (currentTarget != null) {
      if (currentTarget === dialogRef.current) return false
      currentTarget = currentTarget.parentElement
    }
    return true
  }

  if (closed) return null

  return (
    <>
      <StyledFixedBackground />
      <StyledWrapper>
        <StyledRelativeWrapper>
          <StyledRelativeDialog
            tabIndex={-1}
            ref={dialogRef}
            onBlur={closeDialogIfBlurred}
          >
            {children}
          </StyledRelativeDialog>
        </StyledRelativeWrapper>
      </StyledWrapper>
    </>
  )
}

export default RelativeDialog
