import styled from '../../../../lib/styled'
import React, { useEffect, useRef } from 'react'

interface SidebarPopOverProps {
  onClose?: () => void
}

const SidebarPopOver = ({
  children,
  onClose,
}: React.PropsWithChildren<SidebarPopOverProps>) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const listener = (ev: MouseEvent) => {
      if (
        containerRef.current != null &&
        onClose != null &&
        ev.target != null &&
        !containerRef.current.contains(ev.target as Node) &&
        document.body.contains(ev.target as Node)
      ) {
        ev.preventDefault()
        ev.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('click', listener)

    return () => document.removeEventListener('click', listener)
  }, [onClose])

  return (
    <SidebarPopOverContainer ref={containerRef}>
      {children}
    </SidebarPopOverContainer>
  )
}

const SidebarPopOverContainer = styled.div`
  position: fixed;
  top: 15px;
  left: 35px;
  background: ${({ theme }) => theme.colors.background.primary};
  z-index: 101;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  overflow: auto;
`

export default SidebarPopOver
