import React from 'react'
import styled from '../../../../../shared/lib/styled'
import { overflowEllipsis } from '../../../../../shared/lib/styled/styleFunctions'
import { AppComponent } from '../../../../../shared/lib/types'
import Icon from '../../../../../shared/components/atoms/Icon'
import RoundedImage from '../../../../../shared/components/atoms/RoundedImage'
import SidebarContextList from '../atoms/SidebarContextList'
import cc from 'classcat'
import { mdiCheck } from '@mdi/js'

export interface SidebarSpaceProps {
  spaces: SidebarSpace[]
  spaceBottomRows: SidebarSpaceContentRow[]
  onSpacesBlur: () => void
}

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

const SidebarSpaces: AppComponent<SidebarSpaceProps> = ({
  spaces,
  spaceBottomRows,
  className,
  onSpacesBlur,
}) => (
  <Container className={cc(['sidebar__spaces__container', className])}>
    <SidebarContextList className='sidebar__spaces' onBlur={onSpacesBlur}>
      {spaces.map((row, i) => (
        <SidebarSpace
          row={row}
          id={`space-top-${i}`}
          key={`space-top-${i}`}
          onSpacesBlur={onSpacesBlur}
        />
      ))}
      {spaceBottomRows.map((row, i) => (
        <SidebarContentRow
          row={row}
          key={`space-bottom-${i}`}
          id={`space-bottom-${i}`}
          onSpacesBlur={onSpacesBlur}
        />
      ))}
    </SidebarContextList>
  </Container>
)

const SidebarSpace = ({
  row,
  id,
  onSpacesBlur,
}: {
  row: SidebarSpace
  id: string
  onSpacesBlur: () => void
}) => (
  <a
    {...row.linkProps}
    onClick={(event) => {
      if (row.linkProps.onClick == null) {
        return
      }

      event.preventDefault()
      row.linkProps.onClick(event)
      onSpacesBlur()
    }}
    id={id}
    className={cc([
      'sidebar__spaces__item',
      row.active && 'sidebar__spaces__item--active',
    ])}
  >
    <div className='sidebar__spaces__icon'>
      <RoundedImage url={row.icon} alt={row.label} size={30} />
    </div>
    <span className='sidebar__spaces__label'>{row.label}</span>
    {row.active && (
      <Icon size={20} path={mdiCheck} className='sidebar__spaces__icon' />
    )}
    {row.tooltip != null && (
      <span className='sidebar__spaces__tooltip'>{row.tooltip}</span>
    )}
  </a>
)

const SidebarContentRow = ({
  row,
  id,
  onSpacesBlur,
}: {
  row: SidebarSpaceContentRow
  id: string
  onSpacesBlur: () => void
}) => (
  <a
    {...row.linkProps}
    onClick={(event) => {
      if (row.linkProps.onClick == null) {
        return
      }

      event.preventDefault()
      row.linkProps.onClick(event)
      onSpacesBlur()
    }}
    id={id}
    className='sidebar__spaces__item sidebar__spaces__item--bottom'
  >
    <div className='sidebar__spaces__icon'>
      <Icon size={20} path={row.icon} />
    </div>
    <span className='sidebar__spaces__label'>{row.label}</span>
  </a>
)

const Container = styled.div`
  position: fixed;
  top: 15px;
  left: 35px;
  background: ${({ theme }) => theme.colors.background.primary};
  z-index: 101;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  overflow: auto;
  height: calc(100vh - 30px);
  width: calc(100vw - 30px);
  max-width: 350px;
  max-height: 400px;

  .sidebar__spaces {
    display: flex;
    flex-direction: column;
    width: 100%;

    .sidebar__spaces__item {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      overflow: hidden;
      width: 100%;
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      color: ${({ theme }) => theme.colors.text.primary};
      margin: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px
        ${({ theme }) => theme.sizes.spaces.sm}px;
      align-items: center;
      cursor: pointer;
      transition: 200ms all;
      text-decoration: none;
      position: relative;

      &:focus .sidebar__spaces__label {
        text-decoration: underline;
      }

      &:hover {
        background-color: ${({ theme }) => theme.colors.background.tertiary};
      }

      .sidebar__spaces__label {
        ${overflowEllipsis}
      }

      &.sidebar__spaces__item--bottom {
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }

    .sidebar__spaces__tooltip {
      flex: 0 0 auto;
      color: ${({ theme }) => theme.colors.text.subtle};
      margin-right: ${({ theme }) => theme.sizes.spaces.md}px;
    }

    .sidebar__spaces__icon + .sidebar__spaces__tooltip {
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .sidebar__spaces__icon {
      width: 40px;
      text-align: center;
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
    }
  }
`

export default SidebarSpaces
