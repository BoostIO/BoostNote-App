import React, { useCallback, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import {
  menuHeight,
  MenuItem,
  MenuTypes,
  menuVerticalPadding,
  menuZIndex,
  NormalMenuItem,
  useContextMenu,
} from '../../../shared/lib/stores/contextMenu'
import styled from '../../../shared/lib/styled'
import Icon from '../../../shared/components/atoms/Icon'
import UpDownList from '../../../shared/components/atoms/UpDownList'

const ContextMenu = () => {
  const contextMenu = useContextMenu()
  const [windowWith, setWindowWidth] = useState(200)

  useEffectOnce(() => {
    setWindowWidth(
      window.innerWidth ||
        innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
    )
  })

  const closeContextMenu = () => {
    contextMenu!.close()
  }

  const { closed, menuItems, position, id } = contextMenu
  if (closed) return null

  return (
    <Container
      className='context__menu'
      tabIndex={-1}
      style={{
        left: position.x + 130 < windowWith ? position.x : windowWith - 150,
        top: position.y,
      }}
    >
      <UpDownList ignoreFocus={true} onBlur={closeContextMenu}>
        {menuItems.map((menu, index) => {
          const key = `context__menu--${id}-${index}`
          switch (menu.type) {
            case MenuTypes.Normal:
              const nMenu = {
                onClick: () => {
                  return
                },
                ...(menu as NormalMenuItem),
              }
              return (
                <button
                  className='context__menu__item'
                  key={key}
                  onClick={() => {
                    closeContextMenu()
                    nMenu.onClick()
                  }}
                  id={key}
                  disabled={nMenu.enabled == null ? false : !nMenu.enabled}
                >
                  {typeof nMenu.icon === 'string' ? (
                    <Icon path={nMenu.icon} size={16} />
                  ) : (
                    nMenu.icon
                  )}
                  {nMenu.label}
                </button>
              )
            case MenuTypes.Component:
              return <React.Fragment key={key}>{menu.component}</React.Fragment>
            case MenuTypes.Separator:
              return <div className='context__menu__separator' key={key} />
            default:
              return null
          }
        })}
      </UpDownList>
    </Container>
  )
}

export default ContextMenu

interface FocusedContextMenuProps {
  menuItems: MenuItem[]
  id?: string
  position?: { x: number; y: number }
  close: () => void
}

export const FocusedContextMenu = ({
  menuItems,
  position,
  close,
  id = '',
}: FocusedContextMenuProps) => {
  const [windowWith, setWindowWidth] = useState(200)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffectOnce(() => {
    setWindowWidth(
      window.innerWidth ||
        innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
    )
  })

  const onBlurHandler = useCallback(
    (event: any) => {
      if (
        event.relatedTarget == null ||
        menuRef.current == null ||
        !menuRef.current.contains(event.relatedTarget)
      ) {
        close()
        return
      }
    },
    [close]
  )

  if (position == null) return null

  return (
    <Container
      className='context__menu'
      tabIndex={-1}
      style={{
        left: position.x + 130 < windowWith ? position.x : windowWith - 150,
        top: position.y,
      }}
      ref={menuRef}
      onBlurHandler={onBlurHandler}
    >
      <UpDownList ignoreFocus={true} onBlur={close}>
        {menuItems.map((menu, index) => {
          const key = `context__menu--${id}-${index}`
          switch (menu.type) {
            case MenuTypes.Normal:
              const nMenu = {
                ...(menu as NormalMenuItem),
              }
              return (
                <button
                  className='context__menu__item'
                  key={key}
                  onClick={nMenu.onClick}
                  id={key}
                  disabled={(nMenu.enabled = false)}
                  onBlur={onBlurHandler}
                >
                  {typeof nMenu.icon === 'string' ? (
                    <Icon path={nMenu.icon} size={16} />
                  ) : (
                    nMenu.icon
                  )}
                  {nMenu.label}
                </button>
              )
            case MenuTypes.Separator:
              return <div className='context__menu__separator' key={key} />
            default:
              return null
          }
        })}
      </UpDownList>
    </Container>
  )
}

const Container = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: ${menuZIndex};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  padding: ${menuVerticalPadding}px 0;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  outline: none;
  width: auto;

  .context__menu__item {
    height: ${menuHeight}px;
    padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;
    box-sizing: border-box;
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    width: 100%;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    text-align: left;
    transition: 200ms color;
    color: ${({ theme }) => theme.colors.text.primary};

    > * {
      pointer-events: none;
    }

    &:disabled {
      color: ${({ theme }) => theme.colors.text.subtle};
    }

    &:active,
    &.active,
    &:hover {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }

    &:focus {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
    &:disabled {
      background-color: transparent;
    }

    span {
      display: flex;
      align-items: center;
    }
    svg {
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  .context__menu__separator {
    height: 1px;
    margin: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
  }
`
