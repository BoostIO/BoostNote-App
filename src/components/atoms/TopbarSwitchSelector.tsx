import React, { MouseEventHandler } from 'react'
import { border, borderRight } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'

interface TopbarSwitchSelectorItem {
  active?: boolean
  label: React.ReactNode
  title: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

interface TopbarSwitchSelectorProps {
  onClick?: MouseEventHandler<HTMLDivElement>
  onContextMenu?: MouseEventHandler<HTMLDivElement>
  items: TopbarSwitchSelectorItem[]
}

const TopbarSwitchSelector = ({
  onClick,
  onContextMenu,
  items,
}: TopbarSwitchSelectorProps) => {
  return (
    <Container onClick={onClick} onContextMenu={onContextMenu}>
      {items.map((item) => {
        return (
          <ItemButton
            className={item.active ? 'active' : ''}
            key={item.label}
            title={item.title}
            onClick={item.onClick}
          >
            {item.label}
          </ItemButton>
        )
      })}
    </Container>
  )
}

export default TopbarSwitchSelector

const Container = styled.div`
  height: 28px;
  ${border}
  border-radius: 4px;
  overflow: hidden;
`

const ItemButton = styled.button`
  background-color: transparent;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  padding: 0 15px;
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.uiTextColor};
  border: none;
  ${borderRight}
  &:last-child {
    border-right: none;
  }
  &.active {
    background-color: ${({ theme }) => theme.primaryColor};
  }
`
