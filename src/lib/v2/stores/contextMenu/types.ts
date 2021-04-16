import React from 'react'

export const menuHeight = 26
export const menuMargin = 10
export const menuVerticalPadding = 6
export const menuZIndex = 9000

export enum MenuTypes {
  Component = 'Component',
  Normal = 'Normal',
  Separator = 'Separator',
  Submenu = 'Submenu',
}

interface MenuItemBase {
  type: MenuTypes
  enabled?: boolean
  visible?: boolean
}

export interface NormalMenuItem extends MenuItemBase {
  type: MenuTypes.Normal
  icon?: React.ReactNode | string
  label: string | React.ReactNode
  onClick?: () => void
}

export interface SeparatorMenuItem extends MenuItemBase {
  type: MenuTypes.Separator
}

export interface ComponentMenuItem extends MenuItemBase {
  type: MenuTypes.Component
  component: React.ReactNode
}

export interface SubmenuMenuItem extends MenuItemBase {
  type: MenuTypes.Submenu
  submenu: MenuItem[]
}

export type MenuItem = NormalMenuItem | SeparatorMenuItem | ComponentMenuItem

export type Position = { x: number; y: number }

export interface ContextMenuContext {
  closed: boolean
  position: Position
  menuItems: MenuItem[]
  id: number
  popup(event: React.MouseEvent<unknown>, menuItems: MenuItem[]): void
  close(): void
}

export function getContextPositionFromDomElement(
  event: React.MouseEvent<Element>,
  itemsNb: number
) {
  const currentTargetRect = event.currentTarget.getBoundingClientRect()

  const yPositionLimit =
    window.innerHeight -
    menuHeight * itemsNb -
    menuMargin -
    menuVerticalPadding * 2
  const clientYIsLowerThanYPositionLimit =
    currentTargetRect.bottom > yPositionLimit

  const position = {
    // TODO: Limit xPosition
    x: currentTargetRect.left,
    y: clientYIsLowerThanYPositionLimit
      ? yPositionLimit
      : currentTargetRect.bottom,
  }

  return position
}
