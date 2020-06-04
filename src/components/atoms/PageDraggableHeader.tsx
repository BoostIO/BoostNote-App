import React from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'
import { borderBottom } from '../../lib/styled/styleFunctions'

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  -webkit-app-region: drag;
  ${borderBottom}
  height: 40px;

  color: ${({ theme }) => theme.uiTextColor};
`

const IconContainer = styled.div`
  font-size: 18px;
`

const Label = styled.div`
  font-weight: bold;
`

interface PageDraggableHeaderProps {
  iconPath?: string
  label: string
}

const PageDraggableHeader = ({ iconPath, label }: PageDraggableHeaderProps) => {
  return (
    <Container>
      {iconPath != null && (
        <IconContainer>
          <Icon path={iconPath} />
        </IconContainer>
      )}
      <Label>{label}</Label>
    </Container>
  )
}

export default PageDraggableHeader
