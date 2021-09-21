import styled from '../../../../lib/styled'
import React, { useEffect, useRef } from 'react'

interface SidebarPopOverProps {
  onClose?: () => void
  className?: string
}

const SidebarPopOver = ({
  children,
  onClose,
  className,
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
    <SidebarPopOverContainer className={className} ref={containerRef}>
      {children}
    </SidebarPopOverContainer>
  )
}

const SidebarPopOverContainer = styled.div`
  position: fixed;
  left: 55px;
  top: 15px;
  background: ${({ theme }) => theme.colors.background.primary};
  z-index: 102;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  overflow: auto;
`

export default SidebarPopOver
