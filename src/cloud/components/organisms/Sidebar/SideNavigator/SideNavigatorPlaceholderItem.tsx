import React from 'react'
import cc from 'classcat'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavIconStyle,
} from './styled'
import IconMdi from '../../../atoms/IconMdi'
import { mdiCardTextOutline, mdiFolderOutline } from '@mdi/js'

interface SideNavigatorPlaceholderItemProps {
  depth: number
  type: 'doc' | 'folder'
}

const SideNavigatorPlaceholderItem = ({
  depth,
  type,
}: SideNavigatorPlaceholderItemProps) => {
  return (
    <SideNavItemStyle className={cc([`d-${depth}`])}>
      <div className={cc(['sideNavWrapper', 'empty'])}>
        <SideNavClickableButtonStyle
          className='placeholder'
          style={{ paddingLeft: `${12 * (depth - 1) + 26}px` }}
        >
          <SideNavIconStyle>
            {type === 'folder' ? (
              <IconMdi path={mdiFolderOutline} />
            ) : (
              <IconMdi path={mdiCardTextOutline} />
            )}
          </SideNavIconStyle>
          <SideNavLabelStyle>[...]</SideNavLabelStyle>
        </SideNavClickableButtonStyle>
      </div>
    </SideNavItemStyle>
  )
}

export default SideNavigatorPlaceholderItem
