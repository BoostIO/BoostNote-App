import React, { useCallback, useState } from 'react'
import styled from '../../../lib/styled'
import { AppComponent, ControlButtonProps } from '../../../lib/types'
import cc from 'classcat'
import FoldingWrapper, { FoldingProps } from '../../atoms/FoldingWrapper'
import Button, { LoadingButton } from '../../atoms/Button'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import { Emoji } from 'emoji-mart'
import Icon from '../../atoms/Icon'
import { overflowEllipsis } from '../../../lib/styled/styleFunctions'

type NavigationItemIcon =
  | { type: 'emoji'; path: string }
  | { type: 'icon'; path: string }
  | { type: 'node'; icon: React.ReactNode }

export interface NavigationItemProps {
  defaultIcon?: string
  icon?: NavigationItemIcon
  folded?: boolean
  foldIconOnHover?: boolean
  folding?: FoldingProps
  depth?: number
  id?: string
  label: string | React.ReactNode
  labelHref?: string
  labelClick?: () => void
  controls?: ControlButtonProps[]
  active?: boolean
  isCategory?: boolean
  disabled?: boolean
  borderRadius?: boolean
}

const NavItem: AppComponent<
  NavigationItemProps & {
    focused: boolean
    setFocused: React.Dispatch<boolean>
  }
> = ({
  className,
  children,
  depth = 0,
  focused,
  active,
  folded,
  foldIconOnHover,
  folding,
  setFocused,
  label,
  labelHref,
  id,
  icon,
  labelClick,
  controls,
  disabled,
  isCategory,
  borderRadius,
}) => {
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

  const LabelTag = labelHref != null ? 'a' : 'button'
  return (
    <NavigationItemContainer
      className={cc([
        'navigation__item',
        isCategory && 'navigation__item--category',
        focused && 'navigation__item--focused',
        active && 'navigation__item--active',
        foldIconOnHover && 'navigation__item--blinked',
        borderRadius && 'navigation__item--bordered',
        className,
      ])}
      depth={depth > 6 ? 6 : depth}
      onBlur={unfocusOnBlur}
      disabled={disabled}
    >
      <div className='navigation__item__wrapper' draggable={false}>
        {folded != null && !foldIconOnHover && (
          <Button
            variant='icon'
            iconSize={16}
            iconPath={folded ? mdiChevronRight : mdiChevronDown}
            className='navigation__item__icon'
            size='sm'
            onClick={folding?.toggle}
          />
        )}
        <LabelTag
          className='navigation__item__label'
          onFocus={() => setFocused(true)}
          onClick={onClick}
          href={labelHref}
          id={`tree-${id}`}
          tabIndex={0}
          draggable={false}
        >
          {icon != null ? (
            icon.type === 'emoji' ? (
              <Emoji emoji={icon.path} set='apple' size={16} />
            ) : icon.type === 'icon' ? (
              <Icon path={icon.path} size={16} />
            ) : (
              icon.icon
            )
          ) : null}
          <span className='navigation__item__label__ellipsis'>{label}</span>
          {folded != null && foldIconOnHover && (
            <Icon
              size={16}
              path={folded ? mdiChevronRight : mdiChevronDown}
              className='navigation__item__icon'
            />
          )}
          {children}
        </LabelTag>
        {controls != null && controls.length > 0 && (
          <div className='navigation__item__controls'>
            {(controls || []).map((control, i) => (
              <LoadingButton
                spinning={control.spinning}
                key={i}
                variant='icon'
                iconSize={16}
                iconPath={control.icon}
                tabIndex={-1}
                className='navigation__item__control'
                size='sm'
                onClick={control.onClick}
              />
            ))}
          </div>
        )}
      </div>
    </NavigationItemContainer>
  )
}

const NavigationItemContainer = styled.div<{ depth: number }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 26px;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  &.navigation__item--bordered {
    border-radius: ${({ theme }) => theme.borders.radius}px;
  }

  .navigation__item__label > *:not(.navigation__item__label__ellipsis),
  .navigation__item__controls,
  .navigation__item__icon {
    flex: 0 0 auto;
    flex-shrink: 0;
  }

  .navigation__item__controls {
    min-width: 0;
    display: none;
    justify-content: flex-end;
    position: relative;
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
    align-items: center;

    button {
      display: flex;
      padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
      font-size: inherit;
      margin: 0;
    }
  }

  &:hover .navigation__item__controls,
  &.navigation__item--focused .navigation__item__controls {
    display: flex;
    align-items: baseline;
  }

  .navigation__item__wrapper {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding-left: ${({ depth }) => 4 + (depth as number) * 10}px;
  }

  a[href].navigation__item__label {
    cursor: pointer;
  }

  .navigation__item__label {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    background: none;
    outline: 0;
    border: 0;
    text-align: left;
    color: ${({ theme }) => theme.colors.text.secondary};
    padding: 2px 0;
    text-decoration: none;
    margin: 0;
    overflow: hidden;
    svg {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
    .navigation__item__label__ellipsis {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
      ${overflowEllipsis};
    }
  }

  .navigation__item__icon {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  &.navigation__item--blinked {
    .navigation__item__icon {
      opacity: 0;
      transition: opacity 0.2s ease-out;
      color: inherit !important;
      padding-right: ${({ theme }) => theme.sizes.spaces.df}px;
    }
    &:hover {
      .navigation__item__icon {
        opacity: 1;
      }
    }
  }

  &:not(.navigation__item--category) {
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }

    &:active,
    &.navigation__item--active {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:focus,
    &.navigation__item--focused {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }
  }

  &.navigation__item--category {
    .navigation__item__label {
      font-weight: bold;
      padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
      color: ${({ theme }) => theme.colors.text.subtle};
    }

    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    .navigation__item__label__ellipsis {
      flex: 0 1 auto !important;
      padding-left: 0;
      padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    &.navigation__item--focused {
      box-shadow: 0px 0px 0px 1px
        ${({ theme }) => theme.colors.variants.primary.base};
    }
    &:hover {
      box-shadow: 0px 0px 0px 1px
        ${({ theme }) => theme.colors.variants.primary.base};
    }
  }
`

const NavigationItem: AppComponent<NavigationItemProps> = ({
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
        <NavItem
          focused={focused}
          setFocused={setFocused}
          folding={folding}
          {...props}
        />
      </FoldingWrapper>
    )
  }
  return (
    <NavItem
      focused={focused}
      setFocused={setFocused}
      folding={folding}
      {...props}
    />
  )
}

export default NavigationItem
