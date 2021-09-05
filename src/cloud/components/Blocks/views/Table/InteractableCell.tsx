import React, { PropsWithChildren } from 'react'
import styled from '../../../../../design/lib/styled'
import { ControlButtonProps } from '../../../../../design/lib/types'
import cc from 'classcat'

interface InteractableCellProps {
  disabled: boolean
  className?: string
  hoverControls?: ControlButtonProps[]
  onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
}

const InteractableCell = ({
  disabled,
  children,
  onClick,
  className,
}: PropsWithChildren<InteractableCellProps>) => {
  return (
    <Container
      className={cc([
        'interactable-cell',
        disabled && `interactable-cell--disabled`,
        className,
      ])}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Container>
  )
}

const Container = styled.div`
  position: relative;

  &:not(.interactable-cell--disabled) {
    cursor: pointer;
    &:hover {
      background: ${({ theme }) => theme.colors.background.secondary};
    }
  }
`

export default InteractableCell
