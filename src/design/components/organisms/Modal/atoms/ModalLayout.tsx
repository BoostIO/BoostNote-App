import React from 'react'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import styled from '../../../../lib/styled'

interface ModalLayoutProps {
  title?: string
  rows?: {}[]
  sideNav?: {}[]
}

const ModalLayout: AppComponent<ModalLayoutProps> = ({
  className,
  children,
  title,
  rows = [],
}) => (
  <Container className={cc(['modal__content', className])}>
    {title && <h2 className='modal__content__title'>{title}</h2>}
    {rows.length > 0 && <></>}
    {children}
  </Container>
)

const Container = styled.div`
  overflow: auto;
  width: 100%;
  padding: ${({ theme }) => theme.sizes.spaces.df}px
    ${({ theme }) => theme.sizes.spaces.l}px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  overflow: hidden auto;
  color: ${({ theme }) => theme.colors.text.primary};
  height: 100%;
  text-align: left;

  .modal__content__title {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  img {
    max-width: 100%;
  }
`

export default ModalLayout
