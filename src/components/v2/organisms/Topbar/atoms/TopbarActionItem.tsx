import React, { useState } from 'react'
import styled from '../../../../../shared/lib/styled'
import cc from 'classcat'
import { overflowEllipsis } from '../../../../../shared/lib/styled/styleFunctions'
import Icon from '../../../atoms/Icon'
import shortid from 'shortid'

interface TopbarActionItemProps {
  className?: string
  item: TopbarActionItemAttrbs
  depth: number
}

export interface TopbarActionItemAttrbs {
  label: string
  icon: string
  onClick: () => void
}

const TopbarActionItem = ({
  item,
  depth,
  className,
}: TopbarActionItemProps) => {
  const [focused, setFocused] = useState(false)
  const unfocusOnBlur = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  return (
    <Container
      depth={depth}
      className={cc([className, 'topbar__action__item', focused && 'focused'])}
      onBlur={unfocusOnBlur}
      id={`tree-action-${shortid.generate()}`}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault()
        item.onClick()
      }}
      onFocus={() => setFocused(true)}
      tabIndex={1}
    >
      <div className='topbar__action__item__wrapper'>
        <span className='topbar__action__item__label'>
          <Icon path={item.icon} size={16} />
          <span className='topbar__action__item__label__ellipsis'>
            {item.label}
          </span>
        </span>
      </div>
    </Container>
  )
}

const Container = styled.button<{ depth: number }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  background: none;
  text-align: left;

  .topbar__action__item__wrapper {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding-left: ${({ depth }) => 26 + (depth as number) * 20}px;
  }

  .topbar__action__item__label {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.text.primary};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    text-decoration: none;
    margin: 0;
    overflow: hidden;
    .topbar__action__item__label__ellipsis {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      ${overflowEllipsis};
    }
  }

  border-radius: ${({ theme }) => theme.borders.radius}px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
  &:active,
  &.active {
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
  }

  &:focus,
  &.focused {
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }
`

export default TopbarActionItem
