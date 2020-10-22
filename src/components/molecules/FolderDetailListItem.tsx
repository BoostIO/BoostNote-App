import React, { ReactNode, MouseEventHandler } from 'react'
import styled from '../../lib/styled'
import {
  borderBottom,
  textOverflow,
  flexCenter,
} from '../../lib/styled/styleFunctions'
import Icon from '../atoms/Icon'

interface FolderDetailListItemProps {
  iconPath: string
  label: string
  onClick?: MouseEventHandler<HTMLDivElement>
  control?: ReactNode
}

const FolderDetailListItem = ({
  iconPath,
  label,
  onClick,
  control,
}: FolderDetailListItemProps) => {
  return (
    <Container>
      <div className='clickable' onClick={onClick}>
        <div className='icon'>
          <Icon path={iconPath} />
        </div>
        <div className='label'>{label}</div>
      </div>
      <div>{control}</div>
    </Container>
  )
}

export default FolderDetailListItem

const Container = styled.li`
  display: flex;
  align-items: center;
  height: 40px;
  ${borderBottom}
  &:hover {
    background-color: ${({ theme }) => theme.navItemHoverBackgroundColor};
  }
  .clickable {
    flex: 1;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .icon {
    width: 40px;
    height: 40px;
    ${flexCenter}
  }
  .label {
    flex: 1;
    ${textOverflow}
  }
`
