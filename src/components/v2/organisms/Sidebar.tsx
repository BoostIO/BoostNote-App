import React, { useMemo } from 'react'
import {
  defaultSidebarExpandedWidth,
  maxSidebarExpandedWidth,
  minSidebarExpandedWidth,
  SidebarState,
} from '../../../lib/v2/sidebar'
import styled from '../../../lib/v2/styled'
import {
  hideScroll,
  overflowEllipsis,
} from '../../../lib/v2/styled/styleFunctions'
import WidthEnlarger from '../atoms/WidthEnlarger'
import cc from 'classcat'
import Icon from '../atoms/Icon'
import RoundedImage from '../atoms/RoundedImage'
import UpDownList from '../atoms/UpDownList'

type SidebarProps = {
  sidebarState?: SidebarState
  contextRows: SidebarContextRow[]
  sidebarExpandedWidth?: number
  sidebarResize?: (width: number) => void
  className?: string
} & SidebarSpacePickerProps

const Sidebar = ({
  sidebarState,
  contextRows,
  spaces,
  spaceBottomRows,
  sidebarExpandedWidth = defaultSidebarExpandedWidth,
  sidebarResize,
  className,
}: SidebarProps) => {
  return (
    <SidebarContainer className={cc(['sidebar', className])}>
      <SidebarContextIcons rows={contextRows} />
      {sidebarState != null && (
        <WidthEnlarger
          position='right'
          minWidth={minSidebarExpandedWidth}
          maxWidth={maxSidebarExpandedWidth}
          defaultWidth={sidebarExpandedWidth}
          onResizeEnd={sidebarResize}
          className={cc([
            'sidebar__expanded',
            sidebarState === 'spaces' && 'flexible',
          ])}
        >
          <div className='sidebar__expanded__wrapper'>
            {sidebarState === 'spaces' ? (
              <SidebarSpacesPicker
                spaces={spaces}
                spaceBottomRows={spaceBottomRows}
              />
            ) : null}
          </div>
        </WidthEnlarger>
      )}
    </SidebarContainer>
  )
}

export default Sidebar

/** CONTEXT **/
/*************/
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

const SidebarContextIcons = ({ rows }: SidebarContextProps) => {
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
    <div className='sidebar__context__icons'>
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
                <Icon size={20} path={row.icon} />
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
                <Icon size={20} path={row.icon} />
              ) : (
                row.icon
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** EXPANDED **/
/*************/

export type SidebarSpaceContentRow = {
  label: string
  icon: string
  linkProps: React.AnchorHTMLAttributes<{}>
}

export type SidebarSpace = {
  label: string
  active?: boolean
  icon?: string
  tooltip?: string
  linkProps: React.AnchorHTMLAttributes<{}>
}

interface SidebarSpacePickerProps {
  spaces: SidebarSpace[]
  spaceBottomRows: SidebarSpaceContentRow[]
}

const SidebarSpacesPicker = ({
  spaces,
  spaceBottomRows,
}: SidebarSpacePickerProps) => (
  <UpDownList className='sidebar__space__picker sidebar__content'>
    {spaces.map((row, i) => (
      <a
        {...row.linkProps}
        key={`space-top-${i}`}
        id={`space-top-${i}`}
        className='sidebar__space__picker__item'
      >
        <div className='sidebar__space__picker__icon'>
          <RoundedImage url={row.icon} alt={row.label} size='default' />
        </div>
        <span className='sidebar__space__picker__label'>{row.label}</span>
        {row.tooltip != null && (
          <span className='sidebar__space__picker__tooltip'>{row.tooltip}</span>
        )}
      </a>
    ))}
    {spaceBottomRows.map((row, i) => (
      <a
        {...row.linkProps}
        key={`space-bottom-${i}`}
        id={`space-bottom-${i}`}
        className='sidebar__space__picker__item bottom'
      >
        <div className='sidebar__space__picker__icon'>
          <Icon size={20} path={row.icon} />
        </div>
        <span className='sidebar__space__picker__label'>{row.label}</span>
      </a>
    ))}
  </UpDownList>
)

/** STYLE **/

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: top;
  flex: 0 0 auto;
  height: 100vh;

  .sidebar__expanded {
    border-right: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 100%;
    max-height: 100%;

    &.flexible {
      height: fit-content;
      min-height: 200px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
      border-bottom-right-radius: ${({ theme }) => theme.borders.radius}px;
    }
  }

  .sidebar__expanded__wrapper {
    height: 100%;
    overflow: auto;
  }

  .sidebar__space__picker {
    display: flex;
    flex-direction: column;
    width: 100%;

    .sidebar__space__picker__item {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      overflow: hidden;
      width: 100%;
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      color: ${({ theme }) => theme.colors.text.main};
      margin: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px
        ${({ theme }) => theme.sizes.spaces.sm}px;
      align-items: center;
      cursor: pointer;
      transition: 200ms all;
      text-decoration: none;

      &:focus .sidebar__space__picker__label {
        text-decoration: underline;
      }

      &:hover {
        background-color: ${({ theme }) => theme.colors.background.second};
      }

      .sidebar__space__picker__label {
        ${overflowEllipsis}
      }

      &.bottom {
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }

    .sidebar__space__picker__tooltip {
      flex: 0 0 auto;
      color: ${({ theme }) => theme.colors.text.subtle};
      margin-right: ${({ theme }) => theme.sizes.spaces.md}px;
    }

    .sidebar__space__picker__icon {
      width: 40px;
      text-align: center;
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
    }
  }

  .sidebar__context__icons {
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

      &.active {
        color: ${({ theme }) => theme.colors.text.main};
        border-left-color: ${({ theme }) => theme.colors.text.main};
      }
    }
  }
`
