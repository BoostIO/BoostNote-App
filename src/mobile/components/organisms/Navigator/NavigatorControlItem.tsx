import React, { MouseEventHandler } from 'react'
import styled from '../../../../design/lib/styled'
import Icon from '../../../../design/components/atoms/Icon'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'

interface NavigatorControlItemProps {
  iconPath: string
  label: string
  onClick: MouseEventHandler<HTMLButtonElement>
}

const NavigatorControlItem: React.FC<NavigatorControlItemProps> = ({
  iconPath,
  label,
  onClick,
}) => {
  return (
    <Container className='navigator-control-item' onClick={onClick}>
      <Icon
        className='navigator-control-item__icon'
        path={iconPath}
        size={20}
      />
      <div className='navigator-control-item__label'>{label}</div>
    </Container>
  )
}

const Container = styled.button`
  &.navigator-control-item {
    display: flex;
    width: 100%;
    padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
    height: 48px;
    flex-shrink: 0;
    align-items: center;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text.subtle};
    border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
  }

  .navigator-control-item__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    flex-shrink: 0;
  }
  .navigator-control-item__label {
    ${overflowEllipsis}
    flex-grow: 1;
    flex-shrink: 0;
    text-align: left;
  }
`

export default NavigatorControlItem
