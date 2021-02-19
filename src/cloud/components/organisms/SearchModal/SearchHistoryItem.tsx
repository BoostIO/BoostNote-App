import React, { useState } from 'react'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
} from '../Sidebar/SideNavigator/styled'
import IconMdi from '../../atoms/IconMdi'
import { mdiMagnify } from '@mdi/js'
import cc from 'classcat'
import Flexbox from '../../atoms/Flexbox'

interface SearchHistoryItemProps {
  pastQuery: string
  id: string
  setCurrentQuery: (val: string) => void
}

const SearchHistoryItem = ({
  id,
  pastQuery,
  setCurrentQuery,
}: SearchHistoryItemProps) => {
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
      className={cc(['searchResult', focused && 'focused'])}
      onBlur={onBlurHandler}
    >
      <a
        href='#'
        onClick={(e) => {
          e.preventDefault()
          setCurrentQuery(pastQuery)
        }}
        onFocus={() => setFocused(true)}
        className='itemLink'
        id={`shi-${id}`}
      >
        <SideNavClickableButtonStyle>
          <Flexbox flex='initial' style={{ paddingRight: '5px' }}>
            <IconMdi path={mdiMagnify} size={18} />
          </Flexbox>
          <SideNavLabelStyle className='label'>{pastQuery}</SideNavLabelStyle>
        </SideNavClickableButtonStyle>
      </a>
    </SideNavItemStyle>
  )
}

export default SearchHistoryItem
