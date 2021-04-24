import React, { useCallback, useMemo, useState } from 'react'
import { NoteDoc, NoteStorage } from '../../../lib/db/types'
import cc from 'classcat'
import { mdiFileDocumentOutline } from '@mdi/js'
import { getFormattedBoosthubDate } from '../../../cloud/lib/date'
import Icon from '../../../shared/components/atoms/Icon'
import { getNoteTitle } from '../../../lib/db/utils'
import { useStorageRouter } from '../../../lib/storageRouter'
import {
  SideNavItemStyle,
  SideNavIconStyle,
  SideNavLabelStyle,
  StyledNavTagsList,
  SideNavClickableButtonStyle,
  SideNavControlStyle,
  StyledTag,
  sidebarText,
} from '../../../lib/styled/styleFunctionsLocal'
import styled from '../../../shared/lib/styled'
import { defaultTagColor } from '../../../lib/colors'

interface TimelineListItemProps {
  className?: string
  item: NoteDoc
  id: string
  storage: NoteStorage
}

const TimelineListItem = ({
  className,
  item,
  id,
  storage,
}: TimelineListItemProps) => {
  const [focused, setFocused] = useState(false)

  const onBlurHandler = (event: any) => {
    if (
      document.activeElement == null ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setFocused(false)
    }
  }

  const dateLabel = useMemo(() => {
    if (item.archivedAt != null) {
      return (
        <div className='date-label'>
          Archived {getFormattedBoosthubDate(item.archivedAt, true)}
        </div>
      )
    }

    return (
      <div className='date-label'>
        Updated {getFormattedBoosthubDate(item.updatedAt, true)}
      </div>
    )
  }, [item.archivedAt, item.updatedAt])

  const { navigateToNote: _navigateToNote } = useStorageRouter()

  const navigateToNote = useCallback(
    (note: NoteDoc) => {
      _navigateToNote(storage.id, note._id, note.folderPathname)
    },
    [_navigateToNote, storage.id]
  )

  const noteTags = useCallback(
    (doc: NoteDoc) => {
      return doc.tags
        .slice(0, 3)
        .sort()
        .reduce<TagItemProps[]>((list: TagItemProps[], tagName: string) => {
          const tagDoc = storage.tagMap[tagName]
          if (tagDoc != null) {
            list.push({
              id: tagDoc._id,
              color:
                typeof tagDoc.data.color == 'string'
                  ? tagDoc.data.color
                  : defaultTagColor,
              name: tagName,
            })
          }
          return list
        }, []) as TagItemProps[]
    },
    [storage.tagMap]
  )

  // const getTagDynamicStyle = useCallback((tag: TagStyleProps) => {
  //   const invertPercentage = isColorBright(tag.color) ? '100%' : '0%'
  //   return {
  //     color: '#fff',
  //     filter: `invert(${invertPercentage})`,
  //   }
  // }, [])

  return (
    <SideNavItemStyle
      className={cc(['sideNavItemStyle', className, focused && 'focused'])}
      onBlur={onBlurHandler}
    >
      <div className={cc(['sideNavWrapper'])}>
        <SideNavClickableButtonStyle>
          <TimelineIconColorStyle>
            <SideNavIconStyle style={{ width: 20 }}>
              <Icon path={mdiFileDocumentOutline} />
            </SideNavIconStyle>
          </TimelineIconColorStyle>

          <DocLinkStyle
            className='itemLink'
            id={id}
            onClick={() => {
              navigateToNote(item)
            }}
          >
            <SideNavLabelStyle>
              {getNoteTitle(item, 'Untitled')}
            </SideNavLabelStyle>
            {item.tags != null && item.tags.length > 0 && (
              <StyledNavTagsList>
                {/*<div className='wrapper'>*/}
                {/*  {noteTags(item).map((tag: TagItemProps) => (*/}
                {/*    <StyledTag*/}
                {/*      className='mb-0 size-s ml-xsmall'*/}
                {/*      style={{ backgroundColor: tag.color }}*/}
                {/*      key={tag.id}*/}
                {/*    >*/}
                {/*      <span style={getTagDynamicStyle(tag)}>{tag.name}</span>*/}
                {/*    </StyledTag>*/}
                {/*  ))}*/}
                {/*  {item.tags.length > 3 && (*/}
                {/*    <StyledTag className='mb-0 size-s bg-none'>*/}
                {/*      +{item.tags.length - 3}*/}
                {/*    </StyledTag>*/}
                {/*  )}*/}
                {/*</div>*/}
                <div className='wrapper'>
                  {noteTags(item).map((tag: TagItemProps) => (
                    <StyledTag className='mb-0 size-s ml-xsmall' key={tag.id}>
                      {tag.name}
                    </StyledTag>
                  ))}
                  {item.tags.length > 3 && (
                    <StyledTag className='mb-0 size-s bg-none'>
                      +{item.tags.length - 3}
                    </StyledTag>
                  )}
                </div>
              </StyledNavTagsList>
            )}
          </DocLinkStyle>
        </SideNavClickableButtonStyle>
        <SideNavControlStyle className='controls always'>
          {dateLabel}
        </SideNavControlStyle>
      </div>
    </SideNavItemStyle>
  )
}

interface TagItemProps {
  id: string
  name: string
  color: string
}

const TimelineIconColorStyle = styled.div`
  color: ${({ theme }) => theme.colors.text.link};
`

const DocLinkStyle = styled.div`
  padding: 0;
  background-color: transparent;
  border: none;
  min-width: 0;
  width: 100%;
  flex: 1 1 auto;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  cursor: pointer;
  ${sidebarText}

  .icon {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

export default TimelineListItem
