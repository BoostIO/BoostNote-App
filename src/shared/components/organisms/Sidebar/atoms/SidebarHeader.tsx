import React from 'react'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import RoundedImage from '../../../atoms/RoundedImage'
import { mdiChevronDown } from '@mdi/js'
import { overflowEllipsis } from '../../../../lib/styled/styleFunctions'
import Icon from '../../../atoms/Icon'

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
}) => {
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
    </Container>
  )
}

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
    q .button__label {
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
