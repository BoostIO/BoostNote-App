import React, { useMemo } from 'react'
import cc from 'classcat'
import styled from '../../../../../lib/v2/styled'
import { hideScroll } from '../../../../../lib/v2/styled/styleFunctions'
import { AppComponent } from '../../../../../lib/v2/types'
import Icon, { IconSize } from '../../../atoms/Icon'
import WithTooltip from '../../../atoms/WithTooltip'

export type SidebarToolbarRow = {
  icon: string | React.ReactNode
  active?: boolean
  tooltip?: string
  position?: 'top' | 'bottom'
  onClick?: () => void
}

interface SidebarToolbarProps {
  rows: SidebarToolbarRow[]
  iconSize?: IconSize
}

const SidebarToolbar: AppComponent<SidebarToolbarProps> = ({
  rows,
  className,
  iconSize = 26,
}) => {
  const sortedRows = useMemo(() => {
    const sortedRows: {
      top: SidebarToolbarRow[]
      bottom: SidebarToolbarRow[]
    } = { top: [], bottom: [] }

    rows.forEach((row) => {
      if (row.position === 'bottom') {
        sortedRows.bottom.push(row)
      } else {
        sortedRows.top.push(row)
      }
    })

    return sortedRows
  }, [rows])

  return (
    <Container
      className={cc([className, 'sidebar__toolbar'])}
      iconSize={iconSize}
    >
      <div className='sidebar__toolbar__scroller'>
        <div className='sidebar__toolbar__top'>
          {sortedRows.top.map((row, i) => (
            <WithTooltip tooltip={row.tooltip} key={`top-${i}`} side='right'>
              <button
                className={cc([
                  'sidebar__toolbar__item',
                  row.active && 'sidebar__toolbar__item--active',
                ])}
                onClick={row.onClick}
                disabled={row.onClick == null}
                tabIndex={-1}
              >
                {typeof row.icon === 'string' ? (
                  <Icon size={iconSize} path={row.icon} />
                ) : (
                  row.icon
                )}
              </button>
            </WithTooltip>
          ))}
        </div>
        <div className='sidebar__toolbar__bottom'>
          {sortedRows.bottom.map((row, i) => (
            <WithTooltip tooltip={row.tooltip} key={`bottom-${i}`} side='right'>
              <button
                className={cc([
                  'sidebar__toolbar__item',
                  row.active && 'sidebar__toolbar__item--active',
                ])}
                onClick={row.onClick}
                disabled={row.onClick == null}
                tabIndex={-1}
              >
                {typeof row.icon === 'string' ? (
                  <Icon size={iconSize} path={row.icon} />
                ) : (
                  row.icon
                )}
              </button>
            </WithTooltip>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default SidebarToolbar

const Container = styled.div<{ iconSize: number }>`
  &.sidebar__toolbar {
    display: flex;
    flex-direction: column;
    width: 40px;
    height: 100%;
    flex: 0 0 40px;
    background: ${({ theme }) => theme.colors.background.secondary};
    overflow: hidden;

    .sidebar__toolbar__scroller {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      flex-direction: column;
      justify-content: space-between;
      ${hideScroll}
    }

    .sidebar__toolbar__top {
      flex: 1 0 auto;
    }

    .sidebar__toolbar__bottom {
      flex: 0 0 auto;
    }

    .sidebar__toolbar__top .sidebar__toolbar__item:first-of-type {
      margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .sidebar__toolbar__top .sidebar__toolbar__item:last-of-type {
      margin-bottom: 0;
    }

    .sidebar__toolbar__item {
      display: flex;
      align-items: center;
      text-align: center;
      width: 100%;
      height: ${({ iconSize }) => (iconSize as number) + 2}px;
      background: none;
      border: 2px solid transparent;
      color: ${({ theme }) => theme.colors.text.subtle};
      outline: none !important;
      margin: 0 0 ${({ theme }) => theme.sizes.spaces.df}px 0;
      position: relative;
      justify-content: center;

      &:hover,
      &.sidebar__toolbar__item--active {
        color: ${({ theme }) => theme.colors.text.primary};
      }

      &.sidebar__toolbar__item--active {
        border-left-color: ${({ theme }) => theme.colors.text.primary};
      }
    }
  }
`
