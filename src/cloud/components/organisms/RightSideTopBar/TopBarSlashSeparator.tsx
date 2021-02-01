import React from 'react'
import styled from '../../../lib/styled'
import { mdiSlashForward } from '@mdi/js'
import Icon from '../../atoms/Icon'

const ToolbarSlashSeparator = () => {
  return (
    <Container>
      <Icon path={mdiSlashForward} />
    </Container>
  )
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  margin: 0 -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.navButtonColor};
  font-size: 14px;
  user-select: none;
  flex-grow: 0;
  flex-basis: auto;
  flex-shrink: 0;
`

export default ToolbarSlashSeparator
