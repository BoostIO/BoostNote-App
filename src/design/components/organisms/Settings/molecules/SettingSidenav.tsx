import React, { PropsWithChildren } from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'

interface SettingSidenavProps {
  className?: string
  footer?: React.ReactNode
}

const SettingSidenav = React.forwardRef<
  HTMLDivElement,
  PropsWithChildren<SettingSidenavProps>
>(({ className, children, footer }, ref) => {
  return (
    <Container ref={ref} className={cc(['setting__sidenav', className])}>
      <div className='setting__sidenav__scroller'>{children}</div>
      {footer != null && (
        <div className='setting__sidenav__footer'>{footer}</div>
      )}
    </Container>
  )
})

const Container = styled.nav`
  width: 250px;
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  .setting__sidenav__scroller {
    flex: 1 1 auto;
    overflow: hidden auto;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .setting__sidenav__footer {
    flex: 0 0 auto;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default SettingSidenav
