import React, { MouseEventHandler } from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'
import { borderBottom, flexCenter } from '../../lib/styled/styleFunctions'

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
  width: 24px;
  height: 24px;
  ${flexCenter}
`

const Label = styled.div`
  font-weight: bold;
`

interface PageDraggableHeaderProps {
  iconPath?: string
  label: string
  onClick?: MouseEventHandler
  onDoubleClick?: MouseEventHandler
}

const PageDraggableHeader = ({
  iconPath,
  label,
  onClick,
  onDoubleClick,
}: PageDraggableHeaderProps) => {
  return (
    <Container onClick={onClick} onDoubleClick={onDoubleClick}>
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
