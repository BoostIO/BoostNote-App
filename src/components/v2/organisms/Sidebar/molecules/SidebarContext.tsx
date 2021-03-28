import React, { useMemo } from 'react'
import cc from 'classcat'
import styled from '../../../../../lib/v2/styled'
import { hideScroll } from '../../../../../lib/v2/styled/styleFunctions'
import { AppComponent } from '../../../../../lib/v2/types'
import Icon from '../../../atoms/Icon'

export type SidebarContextRow = {
  icon: string | React.ReactNode
  active?: boolean
  tooltip?: string
  position?: 'top' | 'bottom'
  onClick?: () => void
}

interface SidebarContextProps {
  rows: SidebarContextRow[]
}

const SidebarContext: AppComponent<SidebarContextProps> = ({
  rows,
  className,
}) => {
  const sortedRows = useMemo(() => {
    const sortedRows: {
      top: SidebarContextRow[]
      bottom: SidebarContextRow[]
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
    <Container className={cc([className, 'sidebar__context__icons'])}>
      <div className='sidebar__context__icons__scroller'>
        <div className='sidebar__context__icons__top'>
          {sortedRows.top.map((row, i) => (
            <button
              className={cc([
                'sidebar__context__icons__item',
                row.active && 'active',
              ])}
              onClick={row.onClick}
              disabled={row.onClick == null}
              tabIndex={-1}
              key={`top-${i}`}
            >
              {typeof row.icon === 'string' ? (
                <Icon size={22} path={row.icon} />
              ) : (
                row.icon
              )}
            </button>
          ))}
        </div>
        <div className='sidebar__context__icons__bottom'>
          {sortedRows.bottom.map((row, i) => (
            <button
              className={cc([
                'sidebar__context__icons__item',
                row.active && 'active',
              ])}
              onClick={row.onClick}
              disabled={row.onClick == null}
              tabIndex={-1}
              key={`bottom-${i}`}
            >
              {typeof row.icon === 'string' ? (
                <Icon size={22} path={row.icon} />
              ) : (
                row.icon
              )}
            </button>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default SidebarContext

const Container = styled.div`
  &.sidebar__context__icons {
    display: flex;
    flex-direction: column;
    width: 40px;
    height: 100%;
    flex: 0 0 40px;
    background: ${({ theme }) => theme.colors.background.second};
    overflow: hidden;

    .sidebar__context__icons__scroller {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      flex-direction: column;
      justify-content: space-between;
      ${hideScroll}
    }

    .sidebar__context__icons__top {
      flex: 1 0 auto;
    }

    .sidebar__context__icons__bottom {
      flex: 0 0 auto;
    }

    .sidebar__context__icons__top .sidebar__context__icons__item:last-of-type {
      margin-bottom: 0;
    }

    .sidebar__context__icons__item {
      display: flex;
      align-items: center;
      text-align: center;
      width: 100%;
      height: 24px;
      background: none;
      border: 1px solid transparent;
      color: ${({ theme }) => theme.colors.text.subtle};
      outline: none !important;
      margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
      position: relative;
      justify-content: center;

      &:hover,
      &.active {
        color: ${({ theme }) => theme.colors.text.main};
      }

      &.active {
        border-left-color: ${({ theme }) => theme.colors.text.main};
      }
    }
  }
`
