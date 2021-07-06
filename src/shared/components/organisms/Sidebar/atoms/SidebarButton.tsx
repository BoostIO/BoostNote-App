import React, { useCallback, useState } from 'react'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import { overflowEllipsis } from '../../../../lib/styled/styleFunctions'
import Button from '../../../atoms/Button'
import { mdiDotsHorizontal } from '@mdi/js'
import Icon from '../../../atoms/Icon'
import { MenuItem, useContextMenu } from '../../../../lib/stores/contextMenu'

export interface SidebarButtonProps {
  variant: 'primary' | 'transparent' | 'subtle'
  icon: string | React.ReactNode
  id: string
  label: string
  labelHref?: string
  labelClick?: () => void
  contextControls?: MenuItem[]
  active?: boolean
}

const SidebarButton: AppComponent<SidebarButtonProps> = ({
  className,
  id,
  label,
  labelHref,
  labelClick,
  contextControls,
  active,
  icon,
  variant,
}) => {
  const { popup } = useContextMenu()
  const LabelTag = labelHref != null ? 'a' : 'button'
  const [focused, setFocused] = useState(false)
  const unfocusOnBlur = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  const onClick: React.MouseEventHandler = useCallback(
    (event) => {
      if (labelClick == null) {
        return
      }
      event.preventDefault()
      labelClick()
    },
    [labelClick]
  )

  return (
    <Container
      className={cc([
        className,
        'sidebar__button',
        focused && 'focused',
        active && 'sidebar__button--active',
        `sidebar__button--${variant}`,
      ])}
      onBlur={unfocusOnBlur}
    >
      <div className='sidebar__button__wrapper'>
        <LabelTag
          className='sidebar__button__label'
          onFocus={() => setFocused(true)}
          onClick={onClick}
          href={labelHref}
          id={`tree-${id}`}
          tabIndex={1}
        >
          {typeof icon === 'string' ? (
            <Icon path={icon} className='sidebar__button__icon' size={16} />
          ) : (
            icon
          )}
          <span className='sidebar__button__label__ellipsis'>{label}</span>
        </LabelTag>
        {contextControls != null && (
          <div className='sidebar__button__controls'>
            {contextControls != null && (
              <Button
                variant='icon'
                iconSize={16}
                iconPath={mdiDotsHorizontal}
                tabIndex={-1}
                className='sidebar__button__control'
                size='sm'
                onClick={(event) => popup(event, contextControls)}
              />
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .sidebar__button__wrapper {
    height: 26px;
    border-radius: ${({ theme }) => theme.borders.radius}px;
  }

  &.sidebar__button--primary {
    .sidebar__button__wrapper {
      background-color: ${({ theme }) => theme.colors.variants.primary.base};
    }
    .sidebar__button__label,
    .sidebar__button__icon {
      color: ${({ theme }) => theme.colors.variants.primary.text};
    }

    &:hover {
      filter: brightness(1.06);
    }

    &:active,
    &.sidebar__button--active {
      filter: brightness(1.12);
    }

    &:focus,
    &.focused {
      filter: brightness(1.03);
    }
  }

  &.sidebar__button--transparent .sidebar__button__label {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &.sidebar__button--subtle .sidebar__button__label {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  &.sidebar__button--transparent,
  &.sidebar__button--subtle {
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }

    &:active,
    &.sidebar__button--active {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:focus,
    &.focused {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }

    &.sidebar__button--active .sidebar__button__label,
    &:active .sidebar__button__label,
    &:hover .sidebar__button__label,
    &:focus .sidebar__button__label,
    &.focused .sidebar__button__label {
      color: ${({ theme }) => theme.colors.text.primary};
      svg {
        color: inherit;
      }
    }
  }

  .sidebar__button__controls {
    min-width: 0;
    display: none;
    flex: 0 0 auto;
    justify-content: flex-end;
    position: relative;
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
    align-items: center;
    flex-shrink: 0;

    button {
      display: flex;
      padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
      font-size: inherit;
      margin: 0;
    }
  }

  &:hover .sidebar__button__controls,
  &.focused .sidebar__button__controls,
  &.sidebar__category .sidebar__button__controls {
    display: flex;
    align-items: baseline;
  }

  .sidebar__button__wrapper {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  a[href].sidebar__button__label {
    cursor: pointer;
  }

  &:hover .sidebar__button__label svg,
  &:focus .sidebar__button__label svg,
  &.focused .sidebar__button__label svg {
    color: inherit;
  }

  .sidebar__button__label {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    padding: 2px 0;
    text-decoration: none;
    margin: 0;
    overflow: hidden;
    svg {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
    .sidebar__button__label__ellipsis {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
      ${overflowEllipsis};
    }
  }
`

export default SidebarButton
