import React, { useState } from 'react'
import styled from '../../lib/styled'
import { Link } from '../../lib/router'
import Icon from '../atoms/Icon'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'

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
  key?: string
  href?: string
  children?: NavigatorNode[]
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
  const { iconPath, name, href, children } = item
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
          className='headerLink'
          style={{ paddingLeft: `${10 * depth + 22}px` }}
        >
          {iconPath != null && <Icon className='storageIcon' path={iconPath} />}
          {name}
        </Link>
      </div>
      {open &&
        childrenExists &&
        children!.map((child, index) => (
          <SideNavigatorItem
            key={child.key || `${index}-${child.href}`}
            node={child}
            depth={depth + 1}
          />
        ))}
    </StyledContainer>
  )
}

export default SideNavigatorItem
