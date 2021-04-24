import { NoteStorage } from '../../lib/db/types'
import { getTimelineHref, values } from '../../lib/db/utils'
import Application from '../Application'
import { topParentId } from '../../cloud/lib/mappers/topbarTree'
import { mdiClockOutline } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import EmojiIcon from '../../cloud/components/atoms/EmojiIcon'
import { formatDistanceToNow, isBefore, isSameDay, subDays } from 'date-fns'
import { partition } from 'ramda'
import { useRouter } from '../../lib/router'
import TimelineList from '../molecules/Timeline/TimelineList'
import styled from '../../shared/lib/styled'
import { linkText } from '../../lib/styled/styleFunctionsLocal'
import Button from '../../shared/components/atoms/Button'

interface TimelinePageProps {
  storage: NoteStorage
}

export type LocalWorkspaceResourceEventType =
  | 'archiveDoc'
  | 'unarchiveDoc'
  | 'contentUpdate'

export type LocalWorkspaceEventType =
  | LocalWorkspaceResourceEventType
  | 'createDoc'
  | 'tagCreate'
  | 'tagRemoval'
  | 'workspaceCreate'
  | 'workspaceRemoval'
  | 'workspaceUpdate'
  | 'templateUpdate'
  | 'templateDelete'

export interface SerializableAppEventProps {
  id: string
  data: any
  type: LocalWorkspaceEventType
}

export interface SerializedUnserializableAppEventProps {
  createdAt: string
}

export type TimelineEvent = SerializedUnserializableAppEventProps &
  SerializableAppEventProps

function dateFormatDistanceToNow(date: Date) {
  return `${formatDistanceToNow(date)} ago`
}

const maxInitialEvents = 10

const TimelinePage = ({ storage }: TimelinePageProps) => {
  const { push } = useRouter()
  const href = getTimelineHref(storage)

  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [totalNumberOfEvents, setTotalNumberOfEvents] = useState<number>(0)

  const loadEvents = useCallback(
    (amount: number) => {
      const newEvents: TimelineEvent[] = []
      const notes = values(storage.noteMap)
      notes.forEach((note) => {
        if (note.archivedAt != null) {
          newEvents.push({
            createdAt: note.archivedAt,
            type: 'archiveDoc',
            id: note._id,
            data: { ...note },
          })
        } else if (note.updatedAt) {
          newEvents.push({
            createdAt: note.updatedAt,
            type: 'contentUpdate',
            id: note._id,
            data: { ...note },
          })
        } else {
          newEvents.push({
            createdAt: note.createdAt,
            type: 'createDoc',
            id: note._id,
            data: { ...note },
          })
        }
      })
      setTotalNumberOfEvents(newEvents.length)
      setEvents(newEvents.slice(0, amount))
    },
    [storage.noteMap]
  )

  const showMoreEvents = useCallback(
    (query: { amount: number }) => {
      loadEvents(query.amount)
    },
    [loadEvents]
  )

  const { today, thisWeek, others } = useMemo(() => {
    const todayDate = new Date()
    const sevenDaysAgo = subDays(todayDate, 7)

    const [today, rest] = partition(
      (event) => isSameDay(new Date(event.createdAt), todayDate),
      events
    )

    const [thisWeek, others] = partition(
      (event) => isBefore(sevenDaysAgo, new Date(event.createdAt)),
      rest
    )

    return { today, thisWeek, others }
  }, [events])

  useEffect(() => {
    loadEvents(maxInitialEvents)
  }, [loadEvents])

  if (today.length + thisWeek.length + others.length === 0) {
    return (
      <Application
        content={{
          reduced: true,
          topbar: {
            breadcrumbs: [
              {
                label: 'Timeline',
                active: true,
                parentId: topParentId,
                icon: mdiClockOutline,
                link: {
                  href: href,
                  navigateTo: () => push(href),
                },
              },
            ],
          },
          header: (
            <>
              <EmojiIcon
                defaultIcon={mdiClockOutline}
                style={{ marginRight: 10 }}
                size={16}
              />
              <span style={{ marginRight: 10 }}>Timeline</span>
            </>
          ),
        }}
      >
        <StyledTimelinePage>
          <p className='no-document'>
            No documents have been created. Share your knowledge with your
            teammates!
          </p>
        </StyledTimelinePage>
      </Application>
    )
  }

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          breadcrumbs: [
            {
              label: 'Timeline',
              active: true,
              parentId: topParentId,
              icon: mdiClockOutline,
              link: {
                href,
                navigateTo: () => push(href),
              },
            },
          ],
        },
        header: (
          <>
            <EmojiIcon
              defaultIcon={mdiClockOutline}
              style={{ marginRight: 10 }}
              size={16}
            />
            <span style={{ marginRight: 10 }}>Timeline</span>
          </>
        ),
      }}
    >
      <StyledTimelinePage>
        {today.length > 0 ? (
          <TimelineList
            heading='Today'
            events={today}
            timeFormat={dateFormatDistanceToNow}
            storage={storage}
          />
        ) : (
          <>
            <h2>Today</h2>
            <p className='no-event'>No new events today!</p>
          </>
        )}
        <TimelineList
          heading='Past 7 days'
          events={thisWeek}
          storage={storage}
        />

        <TimelineList
          heading='More than 7 days ago'
          events={others}
          storage={storage}
        />
        {totalNumberOfEvents != events.length && (
          <div className={'more-button'}>
            <Button
              onClick={() =>
                showMoreEvents({ amount: Math.max(events.length, 20) + 10 })
              }
            >
              Show More..
            </Button>
          </div>
        )}
      </StyledTimelinePage>
    </Application>
  )
}

const StyledTimelinePage = styled.div`
  padding-bottom: ${({ theme }) => theme.sizes.spaces.df}px;

  .no-event,
  .no-document {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  }

  h1 {
    margin: ${({ theme }) => theme.sizes.spaces.l}px 0;
  }

  h2 {
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px;
    margin-bottom: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
  }

  .more-button {
    display: flex;
    justify-content: center;
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;

    > a {
      ${linkText}
    }
  }
`

export default TimelinePage
