import React, { useMemo } from 'react'
import styled from '../../../shared/lib/styled'
import { NoteDoc, NoteStorage } from '../../../lib/db/types'
import { TimelineEvent } from '../../pages/TimelinePage'
import { useUpDownNavigationListener } from '../../../shared/lib/keyboard'
import TimelineListItem from './TimelineListItem'
import { getHexFromUUID } from '../../../cloud/lib/utils/string'

export interface TimelineListProps {
  heading: string
  events: TimelineEvent[]
  storage: NoteStorage
  timeFormat?: (date: Date) => string
}

const TimelineList = ({ heading, events, storage }: TimelineListProps) => {
  const listRef = React.createRef<HTMLDivElement>()
  useUpDownNavigationListener(listRef)

  const timelineDocs = useMemo(() => {
    return events.reduce<
      {
        doc: NoteDoc
      }[]
    >((acc, event) => {
      if (
        event.type === 'createDoc' ||
        event.type === 'contentUpdate' ||
        event.type === 'archiveDoc'
      ) {
        const doc = storage.noteMap[event.id]
        if (doc != null) {
          acc.push({ doc })
        }
      }
      return acc
    }, [])
  }, [events, storage.noteMap])

  if (events.length === 0) {
    return null
  }

  return (
    <StyledTimelineList>
      <h2>{heading}</h2>
      <StyledTimelineListContentWrapper>
        {timelineDocs.length > 0 ? (
          <StyledTimelineListContent ref={listRef}>
            {timelineDocs.map((timelineDoc) => {
              const childId = `timelinePage-dC${getHexFromUUID(
                timelineDoc.doc._id
              )}`

              return (
                <TimelineListItem
                  item={timelineDoc.doc}
                  key={timelineDoc.doc._id}
                  id={childId}
                  storage={storage}
                />
              )
            })}
          </StyledTimelineListContent>
        ) : (
          <p>No documents or folders have been updated/archived.</p>
        )}
      </StyledTimelineListContentWrapper>
    </StyledTimelineList>
  )
}

export default TimelineList

const StyledTimelineList = styled.div`
  svg {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    vertical-align: middle !important;
  }

  .controls svg {
    transform: translateY(0) !important;
  }

  .label {
    padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-bottom: 0;
  }
`

const StyledTimelineListContentWrapper = styled.div`
  width: 100%;
  margin: auto;

  p {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  }
`

const StyledTimelineListContent = styled.div`
  .marginLeft {
    margin-left: 0 !important;
  }

  .sideNavItemStyle {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0px;
    align-items: flex-start;
    justify-content: initial;
    flex-direction: column;
    height: auto;

    &:not(.non-hover):hover {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:not(.non-hover):focus,
    &:not(.non-hover):active,
    &:not(.non-hover).active {
      background-color: ${({ theme }) => theme.colors.background.quaternary};
    }

    &:not(.non-hover).focused {
      background-color: transparent;
    }
  }

  .sideNavWrapper {
    width: 100%;
    flex: inherit;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
    z-index: initial !important;
  }

  .controls {
    padding-left: 0;
  }

  .itemLink {
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;

    > div {
      font-size: ${({ theme }) => theme.sizes.fonts.df}px;
      white-space: inherit;
    }
  }
`
