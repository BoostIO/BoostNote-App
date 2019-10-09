import React, { useState, MouseEventHandler } from 'react'
import styled from '../../lib/styled'
import { Link } from '../../lib/router'
import Icon from '../atoms/Icon'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'
import cc from 'classcat'

const StyledContainer = styled.div`
  .header {
    position: relative;
    height: 22px;
    display: flex;
    align-items: center;
  }
  .headerLink {
    width: 100%;
    height: 22px;
    display: flex;
    align-items: center;
    text-decoration: none;
    &:hover {
      background-color: ${({ theme }) => theme.colors.alternativeBackground};
    }
    &.active {
      background-color: ${({ theme }) => theme.colors.active};
      color: ${({ theme }) => theme.colors.inverseText};
    }
  }
  .toggleButton {
    position: absolute;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background-color: transparent;
    margin-right: 3px;
    border-radius: 2px;
    top: 2px;
  }
  .storageIcon {
    margin-right: 4px;
  }
`

export interface NavigatorNode {
  iconPath?: string
  name: string
  href?: string
  children?: NavigatorNode[]
  onContextMenu?: MouseEventHandler
  active?: boolean
}

interface SideNavigatorItemProps {
  node: NavigatorNode
  openAlways?: boolean
  depth?: number
}

const SideNavigatorItem = ({
  node: item,
  openAlways = false,
  depth = 0
}: SideNavigatorItemProps) => {
  const { iconPath, name, href, children, onContextMenu, active } = item
  const [open, setOpen] = useState(true)
  const childrenExists = children != null && children.length > 0
  return (
    <StyledContainer>
      <div className='header'>
        {childrenExists && !openAlways && (
          <button
            className='toggleButton'
            onClick={() => setOpen(prevOpen => !prevOpen)}
            style={{ left: `${10 * depth}px` }}
          >
            <Icon path={open ? mdiChevronDown : mdiChevronRight} />
          </button>
        )}
        <Link
          href={href}
          className={cc(['headerLink', active && 'active'])}
          style={{ paddingLeft: `${10 * depth + 22}px` }}
          onContextMenu={onContextMenu}
        >
          {iconPath != null && <Icon className='storageIcon' path={iconPath} />}
          {name}
        </Link>
      </div>
      {open &&
        childrenExists &&
        children!.map(child => (
          <SideNavigatorItem key={child.href} node={child} depth={depth + 1} />
        ))}
    </StyledContainer>
  )
}

export default SideNavigatorItem
