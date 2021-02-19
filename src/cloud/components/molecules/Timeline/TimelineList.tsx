import React, { useMemo } from 'react'
import { SerializedAppEvent } from '../../../interfaces/db/appEvents'
import { useNav } from '../../../lib/stores/nav'
import { getOriginalDocId } from '../../../lib/utils/patterns'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import styled from '../../../lib/styled'
import { getHexFromUUID } from '../../../lib/utils/string'
import TimelineListItem from './TimelineListItem'
import { TimelineUser } from '../../../pages/[teamId]/timeline'

export interface TimelineListProps {
  heading: string
  team: SerializedTeam
  events: SerializedAppEvent[]
  timeFormat?: (date: Date) => string
  usersMap: Map<string, TimelineUser>
}

const TimelineList = ({
  heading,
  team,
  events,
  usersMap,
}: TimelineListProps) => {
  const { docsMap } = useNav()
  const listRef = React.createRef<HTMLDivElement>()
  useUpDownNavigationListener(listRef)

  const timelineDocs = useMemo(() => {
    return events.reduce<
      {
        doc: SerializedDocWithBookmark
        editors: string[]
      }[]
    >((acc, event) => {
      const { resource, editors } = event.data || {}
      if (!Array.isArray(editors) || typeof resource !== 'string') {
        return acc
      }
      const doc = docsMap.get(getOriginalDocId(resource))
      if (doc != null) {
        acc.push({ doc, editors })
      }
      return acc
    }, [])
  }, [events, docsMap])

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
                timelineDoc.doc.id
              )}`

              const editors = timelineDoc.editors.reduce<TimelineUser[]>(
                (acc, editor) => {
                  const user = usersMap.get(editor)
                  if (user != null) {
                    acc.push(user)
                  }
                  return acc
                },
                []
              )

              return (
                <TimelineListItem
                  item={timelineDoc.doc}
                  key={timelineDoc.doc.id}
                  team={team}
                  id={childId}
                  editors={editors}
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
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    vertical-align: middle !important;
  }

  .controls svg {
    transform: translateY(0) !important;
  }

  .label {
    padding-left: ${({ theme }) => theme.space.xsmall}px;
    margin-bottom: 0;
  }
`

const StyledTimelineListContentWrapper = styled.div`
  width: 100%;
  margin: auto;

  p {
    color: ${({ theme }) => theme.baseTextColor};
    font-size: ${({ theme }) => theme.fontSizes.small}px;
  }
`

const StyledTimelineListContent = styled.div`
  .marginLeft {
    margin-left: 0 !important;
  }

  .sideNavItemStyle {
    border-bottom: 1px solid ${({ theme }) => theme.subtleBorderColor};
    padding: ${({ theme }) => theme.space.xsmall}px 0px;
    align-items: flex-start;
    justify-content: initial;
    flex-direction: column;
    height: auto;

    &:not(.non-hover):hover {
      background-color: ${({ theme }) => theme.subtleBackgroundColor};
    }

    &:not(.non-hover):focus,
    &:not(.non-hover):active,
    &:not(.non-hover).active {
      background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
    }

    &:not(.non-hover).focused {
      background-color: transparent;
    }
  }

  .sideNavWrapper {
    width: 100%;
    flex: inherit;
    padding: 0 ${({ theme }) => theme.space.xxsmall}px;
    z-index: initial !important;
  }

  .controls {
    padding-left: 0;
  }

  .itemLink {
    padding: 0 ${({ theme }) => theme.space.xsmall}px;

    > div {
      font-size: ${({ theme }) => theme.fontSizes.default}px;
      white-space: inherit;
    }
  }
`
