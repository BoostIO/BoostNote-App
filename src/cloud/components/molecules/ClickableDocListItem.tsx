import React, { useState } from 'react'
import { SerializedDocWithBookmark } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
} from '../organisms/Sidebar/SideNavigator/styled'
import cc from 'classcat'
import { mdiCardTextOutline } from '@mdi/js'
import { getDocTitle } from '../../lib/utils/patterns'
import SideNavIcon from '../organisms/Sidebar/SideNavigator/SideNavIcon'

interface ClickableDocListItemProps {
  className?: string
  item: SerializedDocWithBookmark
  team: SerializedTeam
  onClick: () => void
  id: string
}

const ClickableDocListItem = ({
  className,
  item,
  onClick,
  id,
}: ClickableDocListItemProps) => {
  const [focused, setFocused] = useState(false)

  const onBlurHandler = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  return (
    <SideNavItemStyle
      className={cc(['sideNavItemStyle', className, focused && 'focused'])}
      onBlur={onBlurHandler}
    >
      <div className={cc(['sideNavWrapper'])}>
        <SideNavClickableButtonStyle>
          <SideNavIcon
            mdiPath={mdiCardTextOutline}
            item={item}
            type='doc'
            className='marginLeft'
          />
          <a
            tabIndex={0}
            href='#'
            className='itemLink'
            onClick={(e) => {
              e.preventDefault()
              onClick()
            }}
            onFocus={() => setFocused(true)}
            id={id}
          >
            <SideNavLabelStyle>
              {getDocTitle(item, 'Untitled')}
            </SideNavLabelStyle>
          </a>
        </SideNavClickableButtonStyle>
      </div>
    </SideNavItemStyle>
  )
}

export default ClickableDocListItem
