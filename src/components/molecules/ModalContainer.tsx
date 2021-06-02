import React, { FC, MouseEventHandler } from 'react'
import styled from '../../shared/lib/styled'
import { flexCenter } from '../../shared/lib/styled/styleFunctions'

interface ModalContainerProps {
  onShadowClick: MouseEventHandler<HTMLDivElement>
}

const ModalContainer: FC<ModalContainerProps> = ({
  onShadowClick,
  children,
}) => {
  return (
    <Container>
      {children}
      <div className='shadow' onClick={onShadowClick} />
    </Container>
  )
}

export default ModalContainer

const Container = styled.div`
  z-index: 6000;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  ${flexCenter}
  & > .shadow {
    position: absolute;
    z-index: 6001;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }
`
