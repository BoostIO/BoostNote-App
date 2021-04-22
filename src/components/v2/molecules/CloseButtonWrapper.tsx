import React from 'react'
import cc from 'classcat'
import styled from '../../../shared/lib/styled'
import Button from '../../../shared/components/atoms/Button'
import { mdiClose } from '@mdi/js'

export interface CloseButtonWrapperProps {
  className?: string
  show?: boolean
  onClick: () => void
}

const CloseButtonWrapper = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<CloseButtonWrapperProps>
>(({ className, children, show = true, onClick }, ref) => {
  return (
    <Container className={cc(['close__button__wrapper', className])}>
      {children}
      {show && (
        <Button
          variant='icon'
          iconPath={mdiClose}
          onClick={onClick}
          ref={ref}
          className='close_button'
          iconSize={16}
          size='sm'
        />
      )}
    </Container>
  )
})

export default CloseButtonWrapper

const Container = styled.div`
  display: inline-flex;
  position: relative;
  align-items: center;

  .close_button {
    position: absolute;
    right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  > *:not(.close_button) {
    width: 100%;
  }
`
