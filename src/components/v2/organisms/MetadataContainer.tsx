import React, { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { focusFirstChildFromElement } from '../../../lib/v2/dom'
import styled from '../../../lib/v2/styled'
import { AppComponent } from '../../../lib/v2/types'

interface MetadataContainerProps {
  rows: MetadataContainerRow[]
}

interface MetadataContainerRow {
  breakAfter?: boolean
}

const MetadataContainer: AppComponent<MetadataContainerProps> = ({}) => {
  const menuRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<
    HTMLDivElement
  >

  useEffectOnce(() => {
    if (menuRef.current != null) {
      focusFirstChildFromElement(menuRef.current)
    }
  })

  return <Container ref={menuRef}></Container>
}

const containerWidth = 350
const Container = styled.div`
  width: ${containerWidth}px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-left: 1px solid transparent;
  background-color: ${({ theme }) => theme.colors.background.second};
  color: ${({ theme }) => theme.colors.text.main};
`

export default MetadataContainer
