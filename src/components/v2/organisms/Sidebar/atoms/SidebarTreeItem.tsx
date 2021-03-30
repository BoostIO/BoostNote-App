import React, { useCallback, useState } from 'react'
import styled from '../../../../../lib/v2/styled'
import { AppComponent } from '../../../../../lib/v2/types'
import cc from 'classcat'
import { overflowEllipsis } from '../../../../../lib/v2/styled/styleFunctions'
import Button from '../../../atoms/Button'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import {
  isSingleKeyEvent,
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../../../lib/v2/keyboard'
import { Emoji } from 'emoji-mart'
import Icon from '../../../atoms/Icon'

interface SidebarTreeItemProps {
  defaultIcon?: string
  depth: number
  emoji?: string
  folded?: boolean
  folding?: FoldingProps
  id?: string
  label: string
  labelHref?: string
  labelClick?: () => void
}

interface SharedProps {
  focused: boolean
  setFocused: React.Dispatch<boolean>
}

export type FoldingProps = {
  fold: () => void
  unfold: () => void
  toggle: () => void
}

const SidebarItem: AppComponent<SidebarTreeItemProps & SharedProps> = ({
  className,
  depth,
  defaultIcon,
  emoji,
  focused,
  folding,
  folded,
  id,
  label,
  labelHref,
  labelClick,
  setFocused,
}) => {
  const LabelTag = labelHref != null ? 'a' : 'button'
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
      depth={depth > 6 ? 6 : depth}
      className={cc([className, 'sidebar__tree__item', focused && 'focused'])}
      onBlur={unfocusOnBlur}
    >
      <div className='sidebar__tree__item__wrapper'>
        {folded != null && (
          <Button
            variant='icon'
            iconSize={16}
            iconPath={folded ? mdiChevronRight : mdiChevronDown}
            className='sidebar__tree__item__icon'
            size='sm'
            onClick={folding?.toggle}
          />
        )}
        <LabelTag
          className='sidebar__tree__item__label'
          onFocus={() => setFocused(true)}
          onClick={labelClick}
          href={labelHref}
          id={`tree-${id}`}
        >
          {emoji != null ? (
            <Emoji emoji={emoji} set='apple' size={16} />
          ) : defaultIcon != null ? (
            <Icon path={defaultIcon} size={16} />
          ) : null}
          <span className='sidebar__tree__item__label__ellipsis'>{label}</span>
        </LabelTag>
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

  .sidebar__tree__item__wrapper {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding-left: ${({ depth }) => 26 + (depth as number) * 20}px;
  }

  a[href].sidebar__tree__item__label {
    cursor: pointer;
  }

  .sidebar__tree__item__label {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.text.main};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    text-decoration: none;
    margin: 0;
    overflow: hidden;
    svg {
      color: ${({ theme }) => theme.colors.text.link};
    }
    .sidebar__tree__item__label__ellipsis {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      ${overflowEllipsis};
    }
  }

  .sidebar__tree__item__icon {
    flex: 0 0 auto;
    padding-left: 0 !important;
  }

  &:not(.sidebar__category) {
    border-radius: ${({ theme }) => theme.borders.radius}px;
    &:hover {
      background-color: ${({ theme }) =>
        theme.colors.background.gradients.first};
    }
    &:active,
    &.active {
      background-color: ${({ theme }) => theme.colors.variants.primary.base};
    }

    &:focus,
    &.focused {
      background-color: ${({ theme }) =>
        theme.colors.background.gradients.second};
    }
  }

  &.sidebar__category {
    .sidebar__tree__item__icon {
      color: currentColor !important;
    }
    &:hover {
      background-color: ${({ theme }) =>
        theme.colors.background.gradients.first};
    }
    &.focused {
      background-color: ${({ theme }) =>
        theme.colors.background.gradients.second};
    }

    border-top: 1px solid ${({ theme }) => theme.colors.border.second};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
  }
`

const FoldingWrapper: React.FC<{ folding: FoldingProps; focused: boolean }> = ({
  focused,
  folding,
  children,
}) => {
  const keyDownHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!focused) {
        return
      }

      if (isSingleKeyEvent(event, 'arrowright')) {
        preventKeyboardEventPropagation(event)
        folding.unfold()
        return
      }

      if (isSingleKeyEvent(event, 'arrowleft')) {
        preventKeyboardEventPropagation(event)
        folding.fold()
        return
      }
    },
    [folding, focused]
  )
  useGlobalKeyDownHandler(keyDownHandler)

  return <>{children}</>
}

const SidebarTreeItem: AppComponent<SidebarTreeItemProps> = ({
  folding,
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  if (folding != null) {
    return (
      <FoldingWrapper folding={folding} focused={focused}>
        <SidebarItem
          focused={focused}
          setFocused={setFocused}
          folding={folding}
          {...props}
        />
      </FoldingWrapper>
    )
  }
  return (
    <SidebarItem
      focused={focused}
      setFocused={setFocused}
      folding={folding}
      {...props}
    />
  )
}

export default SidebarTreeItem
