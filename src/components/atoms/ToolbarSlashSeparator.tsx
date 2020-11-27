import React from 'react'
import styled from '../../lib/styled'
import { mdiSlashForward } from '@mdi/js'
import Icon from './Icon'
import { flexCenter } from '../../lib/styled/styleFunctions'

const ToolbarSlashSeparator = () => {
  return (
    <Container>
      <Icon path={mdiSlashForward} />
    </Container>
  )
}

const Container = styled.div`
  height: 24px;
  margin: 0 -5px;
  ${flexCenter}
  color: ${({ theme }) => theme.navButtonColor};
  font-size: 14px;
  user-select: none;
`

export default ToolbarSlashSeparator
