import React, { useState, useEffect, useCallback } from 'react'
import IconMdi from '../atoms/IconMdi'
import { mdiMenu, mdiClose } from '@mdi/js'
import styled from '../../lib/styled'

interface ToggleSectionProps {
  children?: React.ReactNode
  open?: boolean
  onToggle?: (open: boolean) => boolean
}

const ToggleSection = ({
  children,
  open = false,
  onToggle = (prev) => !prev,
}: ToggleSectionProps) => {
  const [openInternal, setOpen] = useState(open)

  useEffect(() => {
    setOpen(open)
  }, [open])

  const toggle = useCallback(() => {
    setOpen((prev) => onToggle(!prev))
  }, [onToggle])

  return (
    <StyledToggleSection>
      <div className='toggle' onClick={toggle}>
        <IconMdi path={openInternal ? mdiClose : mdiMenu} size={32} />
      </div>
      {openInternal && children}
    </StyledToggleSection>
  )
}

export default ToggleSection

const StyledToggleSection = styled.div`
  min-width: 85px;
  position: relative;
  border-left: solid 1px ${({ theme }) => theme.subtleBorderColor};

  .toggle {
    color: ${({ theme }) => theme.subtleTextColor};
    position: absolute;
    top: 25px;
    right: 25px;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.baseTextColor};
    }
  }
`
