import React, { useState } from 'react'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
} from '../organisms/Sidebar/SideNavigator/styled'
import cc from 'classcat'

interface ClickableListItemProps {
  className?: string
  label: React.ReactNode
  icon?: React.ReactNode
  onClick: () => void
  id: string
}

const ClickableListItem = ({
  className,
  icon,
  label,
  onClick,
  id,
}: ClickableListItemProps) => {
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
          {icon}
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
            <SideNavLabelStyle>{label}</SideNavLabelStyle>
          </a>
        </SideNavClickableButtonStyle>
      </div>
    </SideNavItemStyle>
  )
}

export default ClickableListItem
