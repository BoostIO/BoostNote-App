import React from 'react'
import styled from '../../../../../shared/lib/styled'
import ContextMenuClose from '../atoms/ContextMenuClose'

const PreferencesContextMenuWrapper: React.FC = ({ children }) => (
  <Container>
    <ContextMenuClose />
    {children}
  </Container>
)

const Container = styled.div`
  position: relative;
  width: fit-content;
  height: auto;
`

export default PreferencesContextMenuWrapper
