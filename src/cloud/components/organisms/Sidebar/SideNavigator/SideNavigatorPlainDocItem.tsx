import React, { useState } from 'react'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import { usePage } from '../../../../lib/stores/pageStore'
import cc from 'classcat'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
  SideNavIconStyle,
} from './styled'
import { mdiCardTextOutline } from '@mdi/js'
import DocLink from '../../../atoms/Link/DocLink'
import SideNavigatorDocControls from './SideNavigatorDocControls'
import { getDocTitle } from '../../../../lib/utils/patterns'
import { getHexFromUUID } from '../../../../lib/utils/string'
import { Emoji } from 'emoji-mart'
import IconMdi from '../../../atoms/IconMdi'

interface SideNavigatorPlainDocItemProps {
  item: SerializedDocWithBookmark
}

const SideNavigatorPlainDocItem = ({
  item,
}: SideNavigatorPlainDocItemProps) => {
  const { pageDoc } = usePage()
  const { team, currentUserPermissions } = usePage()
  const depth = 0
  const folderIsActive = pageDoc == null ? false : item.id === pageDoc.id

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
    <div className='draggable' draggable={false} onBlur={onBlurHandler}>
      <SideNavItemStyle
        className={cc([
          `d-${depth}`,
          folderIsActive && 'active',
          focused && 'focused',
        ])}
      >
        <div className={cc(['sideNavWrapper', 'empty'])}>
          <SideNavClickableButtonStyle
            style={{ paddingLeft: `${12 * (depth - 1) + 26}px` }}
          >
            <SideNavIconStyle
              className={cc(['emoji-icon'])}
              style={{ width: 20 }}
            >
              {item.emoji != null ? (
                <Emoji emoji={item.emoji} set='apple' size={16} />
              ) : (
                <IconMdi path={mdiCardTextOutline} />
              )}
            </SideNavIconStyle>
            <DocLink
              doc={item}
              team={team!}
              className='itemLink'
              onFocus={() => setFocused(true)}
              id={`tree-dC${getHexFromUUID(item.id)}`}
            >
              <SideNavLabelStyle>
                {getDocTitle(item, 'Untitled')}
              </SideNavLabelStyle>
            </DocLink>
          </SideNavClickableButtonStyle>
        </div>
        {currentUserPermissions != null && (
          <SideNavControlStyle className='controls'>
            <SideNavigatorDocControls doc={item} focused={focused} />
          </SideNavControlStyle>
        )}
      </SideNavItemStyle>
    </div>
  )
}

export default SideNavigatorPlainDocItem
