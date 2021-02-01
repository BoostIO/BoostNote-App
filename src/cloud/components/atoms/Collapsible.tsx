import React, { useState, useCallback } from 'react'
import IconMdi from './IconMdi'
import { mdiChevronRight, mdiChevronDown } from '@mdi/js'
import styled from '../../lib/styled'

interface CollapsibleProps {
  header: React.ReactElement
  content: React.ReactElement
  defaultState?: boolean
}

const Collapsible = ({
  header,
  content,
  defaultState = false,
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultState)

  const toggle = useCallback(() => {
    setIsOpen((state) => !state)
  }, [])

  return (
    <>
      <StyledCollapsibleHeader onClick={toggle}>
        <IconMdi path={isOpen ? mdiChevronDown : mdiChevronRight} size={24} />
        {header}
      </StyledCollapsibleHeader>
      <StyledCollapsibleContent>{isOpen && content}</StyledCollapsibleContent>
    </>
  )
}

const StyledCollapsibleHeader = styled.div`
  display: flex;
  width: 100%;
  cursor: pointer;

  svg {
    align-self: center;
  }
`

const StyledCollapsibleContent = styled.div`
  margin-left: 24px;
`

export default Collapsible
