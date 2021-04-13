import React, { useState } from 'react'
import { useEffectOnce } from 'react-use'
import {
  menuHeight,
  MenuTypes,
  menuVerticalPadding,
  menuZIndex,
  NormalMenuItem,
  useContextMenu,
} from '../../../lib/v2/stores/contextMenu'
import styled from '../../../lib/v2/styled'
import Icon from '../atoms/Icon'
import UpDownList from '../atoms/UpDownList'

const ContextMenu = () => {
  const contextMenu = useContextMenu()
  const [windowWith, setWindowWidth] = useState(200)
  const menuRef: React.RefObject<HTMLDivElement> = React.createRef()

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

  const closeContextMenuIfMenuBlurred = (
    event: React.FocusEvent<HTMLDivElement>
  ) => {
    if (isMenuBlurred(event.relatedTarget)) {
      closeContextMenu()
    }
  }

  const isMenuBlurred = (relatedTarget: any): boolean => {
    if (menuRef.current == null) return true
    let currentTarget: HTMLElement | null | undefined = relatedTarget
    while (currentTarget != null) {
      if (currentTarget === menuRef.current) return false
      currentTarget = currentTarget.parentElement
    }
    return true
  }

  const { closed, menuItems, position, id } = contextMenu
  if (closed) return null

  return (
    <Container
      className='context__menu'
      tabIndex={-1}
      ref={menuRef}
      onBlur={closeContextMenuIfMenuBlurred}
      style={{
        left: position.x + 130 < windowWith ? position.x : windowWith - 150,
        top: position.y,
      }}
    >
      <UpDownList ignoreFocus={true}>
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

const Container = styled.div`
  min-width: 130px;
  position: fixed;
  z-index: ${menuZIndex};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  padding: ${menuVerticalPadding}px 0;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
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
    font-size: ${({ theme }) => theme.sizes.fonts.xsm}px;
    text-align: left;
    transition: 200ms color;
    color: ${({ theme }) => theme.colors.text.primary};

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
