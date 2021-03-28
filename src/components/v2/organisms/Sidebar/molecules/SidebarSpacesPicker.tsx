import React from 'react'
import styled from '../../../../../lib/v2/styled'
import { overflowEllipsis } from '../../../../../lib/v2/styled/styleFunctions'
import { AppComponent } from '../../../../../lib/v2/types'
import Icon from '../../../atoms/Icon'
import RoundedImage from '../../../atoms/RoundedImage'
import SidebarContextList from '../atoms/SidebarContextList'

export interface SidebarSpacePickerProps {
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

const SidebarSpacesPicker: AppComponent<SidebarSpacePickerProps> = ({
  spaces,
  spaceBottomRows,
}) => (
  <Container>
    <SidebarContextList className='sidebar__space__picker sidebar__content'>
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
            <span className='sidebar__space__picker__tooltip'>
              {row.tooltip}
            </span>
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
            <Icon size={22} path={row.icon} />
          </div>
          <span className='sidebar__space__picker__label'>{row.label}</span>
        </a>
      ))}
    </SidebarContextList>
  </Container>
)

const Container = styled.div`
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
        background-color: ${({ theme }) =>
          theme.colors.background.gradients.first};
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
`

export default SidebarSpacesPicker
