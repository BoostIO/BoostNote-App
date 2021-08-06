import React from 'react'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import RoundedImage from '../../../atoms/RoundedImage'
import { mdiChevronDown, mdiDotsHorizontal } from '@mdi/js'
import { overflowEllipsis } from '../../../../lib/styled/styleFunctions'
import Icon from '../../../atoms/Icon'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../../lib/stores/contextMenu'
import Checkbox from '../../../molecules/Form/atoms/FormCheckbox'
import Radio from '../../../molecules/Form/atoms/FormRadio'

interface SidebarHeaderProps {
  spaceImage?: string
  spaceName: string
  onSpaceClick: () => void
  controls?: SidebarControls
}

export type SidebarControls = {
  [category: string]: SidebarControl[]
}

export interface SidebarControl {
  type: 'check' | 'radio'
  label: string
  checked: boolean
  onClick: () => void
}

const SidebarHeader: AppComponent<SidebarHeaderProps> = ({
  className,
  onSpaceClick,
  spaceImage,
  spaceName,
  controls,
}) => {
  const { popup } = useContextMenu()
  return (
    <Container className={cc(['sidebar__header', className])}>
      <Button
        variant='transparent'
        className='sidebar__header__space'
        id='sidebar__active__space'
        onClick={onSpaceClick}
        icon={
          <RoundedImage
            className='button__icon'
            size={22}
            alt={spaceName}
            url={spaceImage}
          />
        }
      >
        <span>{spaceName}</span>
        <Icon
          className='sidebar__space__dropdown'
          size={16}
          path={mdiChevronDown}
        />
      </Button>
      {controls != null && (
        <Button
          variant='icon'
          size='sm'
          className='sidebar__header__controls'
          iconPath={mdiDotsHorizontal}
          iconSize={20}
          onClick={async (event) => {
            popup(event, mapControlsToPopup(controls))
          }}
        />
      )}
    </Container>
  )
}

function mapControlsToPopup(controls: SidebarControls) {
  const items: MenuItem[] = []

  Object.entries(controls).forEach(([category, value]) => {
    items.push({
      type: MenuTypes.Component,
      component: <PopupCategory>{category}</PopupCategory>,
    })
    value.forEach((option) => {
      items.push({
        type: MenuTypes.Normal,
        onClick: option.onClick,
        label: (
          <span>
            {option.type === 'check' ? (
              <Checkbox checked={option.checked} />
            ) : (
              <Radio checked={option.checked} />
            )}
            <span style={{ paddingLeft: 6 }}>{option.label}</span>
          </span>
        ),
      })
    })
  })

  return items
}

const PopupCategory = styled.div`
  padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  color: ${({ theme }) => theme.colors.text.subtle};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  &.last {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

const Container = styled.div`
  &.sidebar__header {
    display: flex;
    justify-content: space-between;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px 0
      ${({ theme }) => theme.sizes.spaces.df}px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
    align-items: center;
    font-size: ${({ theme }) => theme.sizes.fonts.md}px;
  }

  .sidebar__header__space {
    flex: 1 1 auto;
    justify-content: left;
    min-width: 30px;
    color: ${({ theme }) => theme.colors.text.secondary};
    .button__label {
      text-align: left;
      justify-content: left;
      flex: 0 1 auto;
      overflow: hidden;
      span {
        ${overflowEllipsis}
      }

      .sidebar__space__dropdown {
        flex: 0 0 auto;
      }
    }
  }
`

export default SidebarHeader
