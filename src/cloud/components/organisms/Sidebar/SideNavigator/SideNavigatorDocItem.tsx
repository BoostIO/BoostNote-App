import React, { useState } from 'react'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import { usePage } from '../../../../lib/stores/pageStore'
import cc from 'classcat'
import {
  SideNavItemStyle,
  SideNavClickableButtonStyle,
  SideNavLabelStyle,
  SideNavControlStyle,
} from './styled'
import { mdiCardTextOutline } from '@mdi/js'
import DocLink from '../../../atoms/Link/DocLink'
import SideNavigatorDocControls from './SideNavigatorDocControls'
import { onDragLeaveCb, SidebarDragState, DraggedTo } from '../../../../lib/dnd'
import { NavResource } from '../../../../interfaces/resources'
import { getDocTitle } from '../../../../lib/utils/patterns'
import { getHexFromUUID } from '../../../../lib/utils/string'
import SideNavIcon from './SideNavIcon'

interface SideNavigatorDocItemProps {
  item: SerializedDocWithBookmark
  onDragStart: (resource: NavResource) => void
  onDrop: (resource: NavResource, targetedPosition: SidebarDragState) => void
}

const SideNavigatorDocItem = ({
  item,
  onDragStart,
  onDrop,
}: SideNavigatorDocItemProps) => {
  const { pageDoc } = usePage()
  const { team } = usePage()
  const [draggedOver, setDraggedOver] = useState<SidebarDragState>()
  const dragRef = React.createRef<HTMLDivElement>()

  const pathSplit =
    item.folderPathname[item.folderPathname.length - 1] !== '/'
      ? (item.folderPathname + '/').split('/').slice(1)
      : item.folderPathname.split('/').slice(1)
  const depth = pathSplit.length + 1
  const folderIsActive = pageDoc == null ? false : item.id === pageDoc.id

  const onDragOverHandler: React.DragEventHandler = (event) => {
    event.preventDefault()
    const dragY = event.pageY
    const rect = dragRef.current!.getBoundingClientRect()
    const treshold = rect.top + rect.height / 2

    if (dragY < treshold) {
      setDraggedOver(DraggedTo.beforeItem)
    } else {
      setDraggedOver(DraggedTo.afterItem)
    }
  }

  const onDragLeaveHandler: React.DragEventHandler<HTMLDivElement> = (
    event
  ) => {
    onDragLeaveCb(event, dragRef, () => setDraggedOver(undefined))
  }

  const onDropHandler = (event: any) => {
    event.preventDefault()
    onDrop({ type: 'doc', result: item }, draggedOver)
    setDraggedOver(undefined)
  }

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
    <div
      className='draggable'
      draggable={true}
      onDragStart={() => onDragStart({ type: 'doc', result: item })}
      onDragLeave={onDragLeaveHandler}
      onDragOver={onDragOverHandler}
      onDrop={onDropHandler}
      ref={dragRef}
      onBlur={onBlurHandler}
    >
      <SideNavItemStyle
        className={cc([
          `d-${depth}`,
          folderIsActive && 'active',
          draggedOver != null && `dragged-over dragged-over${draggedOver}`,
          focused && 'focused',
        ])}
      >
        <div className={cc(['sideNavWrapper', 'empty'])}>
          <SideNavClickableButtonStyle
            style={{ paddingLeft: `${12 * (depth - 1) + 26}px` }}
          >
            <SideNavIcon mdiPath={mdiCardTextOutline} item={item} type='doc' />
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
        <SideNavControlStyle className='controls'>
          <SideNavigatorDocControls doc={item} focused={focused} />
        </SideNavControlStyle>
      </SideNavItemStyle>
    </div>
  )
}

export default SideNavigatorDocItem
