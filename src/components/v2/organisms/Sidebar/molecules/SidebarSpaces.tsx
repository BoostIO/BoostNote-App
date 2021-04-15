import React from 'react'
import styled from '../../../../../lib/v2/styled'
import { overflowEllipsis } from '../../../../../lib/v2/styled/styleFunctions'
import { AppComponent } from '../../../../../lib/v2/types'
import Icon from '../../../atoms/Icon'
import RoundedImage from '../../../atoms/RoundedImage'
import SidebarContextList from '../atoms/SidebarContextList'

export interface SidebarSpaceProps {
  spaces: SidebarSpace[]
  spaceBottomRows: SidebarSpaceContentRow[]
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
}) => (
  <Container>
    <SidebarContextList className='sidebar__spaces'>
      {spaces.map((row, i) => (
        <a
          {...row.linkProps}
          key={`space-top-${i}`}
          id={`space-top-${i}`}
          className='sidebar__spaces__item'
        >
          <div className='sidebar__spaces__icon'>
            <RoundedImage url={row.icon} alt={row.label} size={30} />
          </div>
          <span className='sidebar__spaces__label'>{row.label}</span>
          {row.tooltip != null && (
            <span className='sidebar__spaces__tooltip'>{row.tooltip}</span>
          )}
        </a>
      ))}
      {spaceBottomRows.map((row, i) => (
        <a
          {...row.linkProps}
          key={`space-bottom-${i}`}
          id={`space-bottom-${i}`}
          className='sidebar__spaces__item sidebar__spaces__item--bottom'
        >
          <div className='sidebar__spaces__icon'>
            <Icon size={22} path={row.icon} />
          </div>
          <span className='sidebar__spaces__label'>{row.label}</span>
        </a>
      ))}
    </SidebarContextList>
  </Container>
)

const Container = styled.div`
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
