import React, { useState } from 'react'
import { BreadCrumbTreeItem } from '../../../../../lib/v2/mappers/types'
import styled from '../../../../../lib/v2/styled'
import { AppComponent } from '../../../../../lib/v2/types'
import FoldingWrapper from '../../../atoms/FoldingWrapper'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import { Emoji } from 'emoji-mart'
import { overflowEllipsis } from '../../../../../lib/v2/styled/styleFunctions'
import Icon from '../../../atoms/Icon'

interface TopbarTreeItemProps {
  className?: string
  item: BreadCrumbTreeItem
  depth: number
  folded?: boolean
  folding?: {
    fold: () => void
    unfold: () => void
    toggle: () => void
  }
}

interface SharedProps {
  focused: boolean
  setFocused: React.Dispatch<boolean>
}

const TopbarItem = ({
  item,
  setFocused,
  depth,
  className,
  focused,
  folded,
  folding,
}: TopbarTreeItemProps & SharedProps) => {
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
      className={cc([className, 'topbar__tree__item', focused && 'focused'])}
      onBlur={unfocusOnBlur}
    >
      <div className='topbar__tree__item__wrapper'>
        {folded != null && (
          <Button
            variant='icon'
            iconSize={16}
            iconPath={folded ? mdiChevronRight : mdiChevronDown}
            className='topbar__tree__item__icon'
            size='sm'
            onClick={folding?.toggle}
          />
        )}
        <a
          className='topbar__tree__item__label'
          onFocus={() => setFocused(true)}
          onClick={() => item.link.navigateTo()}
          href={item.link.href}
          id={`tree-${item.id}`}
          tabIndex={1}
        >
          {item.emoji != null ? (
            <Emoji emoji={item.emoji} set='apple' size={16} />
          ) : item.defaultIcon != null ? (
            <Icon path={item.defaultIcon} size={16} />
          ) : null}
          <span className='topbar__tree__item__label__ellipsis'>
            {item.label}
          </span>
        </a>
      </div>
    </Container>
  )
}

const Container = styled.div<{ depth: number }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .topbar__tree__item__wrapper {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding-left: ${({ depth }) => 26 + (depth as number) * 20}px;
  }

  .topbar__tree__item__label {
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
    svg {
      color: ${({ theme }) => theme.colors.text.link};
    }
    .topbar__tree__item__label__ellipsis {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      ${overflowEllipsis};
    }
  }

  .topbar__tree__item__icon {
    flex: 0 0 auto;
    padding-left: 0 !important;
    padding-right: 0 !important;
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

const TopbarTreeItem: AppComponent<TopbarTreeItemProps> = ({
  folding,
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  if (folding != null) {
    return (
      <FoldingWrapper
        fold={folding.fold}
        unfold={folding.unfold}
        focused={focused}
      >
        <TopbarItem
          focused={focused}
          setFocused={setFocused}
          folding={folding}
          {...props}
        />
      </FoldingWrapper>
    )
  }
  return (
    <TopbarItem
      focused={focused}
      setFocused={setFocused}
      folding={folding}
      {...props}
    />
  )
}

export default TopbarTreeItem
