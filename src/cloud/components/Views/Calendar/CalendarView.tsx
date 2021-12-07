import React, { useCallback, useMemo } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getDocTitle } from '../../../lib/utils/patterns'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Button from '../../../../design/components/atoms/Button'
import { useCalendarView } from '../../../lib/hooks/views/calendarView'
import Calendar from '../../../../design/components/organisms/Calendar'
import CalendarEventItem from './CalendarEventItem'
import { DateSelectArg, EventApi, EventSourceInput } from '@fullcalendar/react'
import { isArray } from 'lodash'
import { filterIter } from '../../../lib/utils/iterator'
import { useModal } from '../../../../design/lib/stores/modal'
import CalendarEventItemContextMenu from './CalendarEventItemContextMenu'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { intervalToDuration, format as formatDate } from 'date-fns'
import { cleanupDateProp, getIconPathOfPropType } from '../../../lib/props'
import Icon from '../../../../design/components/atoms/Icon'
import { mdiCalendarMonthOutline, mdiFileDocumentOutline } from '@mdi/js'
import CalendarWatchedPropContext from './CalendarWatchedPropContext'
import { useRouter } from '../../../lib/router'
import CalendarNoDateContext from './CalendarNoDateContext'
import { getDocLinkHref } from '../../Link/DocLink'

type CalendarViewProps = {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  team: SerializedTeam
  currentWorkspaceId?: string
  currentFolderId?: string
  viewsSelector: React.ReactNode
}

const CalendarView = ({
  view,
  team,
  docs,
  viewsSelector,
  currentUserIsCoreMember,
  currentWorkspaceId,
  currentFolderId,
}: CalendarViewProps) => {
  const { push } = useRouter()
  const { openNewDocForm } = useCloudResourceModals()
  const { openContextModal, closeAllModals } = useModal()

  const { watchedProp, actionsRef } = useCalendarView({
    view,
  })

  const docEvents: EventSourceInput = useMemo(() => {
    return docs.map((doc) => {
      const dateProps = (doc.props || {})[watchedProp.name]

      const props: any = {
        start: undefined,
        end: undefined,
        date: undefined,
        allDay: true,
      }
      if (
        dateProps != null &&
        dateProps.type === watchedProp.type &&
        dateProps.data != null
      ) {
        if (!isArray(dateProps.data)) {
          props.start = dateProps.data
        } else {
          const orderedDates = dateProps.data.sort((a, b) => {
            if (a < b) {
              return -1
            } else {
              return 1
            }
          })
          if (dateProps.data.length === 2) {
            props.start = orderedDates[0]
            const endDate = new Date(orderedDates[1])
            endDate.setDate(endDate.getDate() + 1)
            props.end = endDate
          }
        }
      }
      return {
        title: getDocTitle(doc, 'Untitled'),
        ...props,
        extendedProps: {
          doc,
          onClick: () => push(getDocLinkHref(doc, team, 'index')),
          onContextClick: (event: React.MouseEvent) =>
            openContextModal(
              event,
              <CalendarEventItemContextMenu doc={doc} team={team} />,
              {
                removePadding: true,
                width: 200,
              }
            ),
        },
      }
    })
  }, [docs, team, watchedProp, push, openContextModal])

  const noDateDocs = useMemo(() => {
    return filterIter(
      ({ props = {} }) =>
        props[watchedProp.name] == null ||
        props[watchedProp.name].data == null ||
        props[watchedProp.name].type !== watchedProp.type,
      docs
    )
  }, [watchedProp, docs])

  const handleNewDateSelection = useCallback(
    (val: DateSelectArg) => {
      const cleanedDateProp = getCleanedDatesWithDuration(val.start, val.end)
      return openNewDocForm(
        {
          team: team,
          workspaceId: currentWorkspaceId,
          parentFolderId: currentFolderId,
          props: [
            [
              watchedProp.name,
              {
                type: 'date',
                data:
                  cleanedDateProp.length === 1
                    ? cleanedDateProp[0]
                    : cleanedDateProp,
              },
            ],
          ],
        },
        {
          precedingRows: [
            {
              description: `${watchedProp.name}: ${
                cleanedDateProp.length > 1
                  ? `${formatDate(
                      cleanedDateProp[0],
                      'MMM dd, yyyy'
                    )} -> ${formatDate(cleanedDateProp[1], 'MMM dd, yyyy')}`
                  : formatDate(cleanedDateProp[0], 'MMM dd, yyyy')
              }`,
            },
          ],
          skipRedirect: true,
        }
      )
    },
    [
      currentFolderId,
      currentWorkspaceId,
      openNewDocForm,
      watchedProp.name,
      team,
    ]
  )

  const handleEventChange = useCallback(
    async (resize: { event: EventApi }) => {
      if (
        resize.event.start == null ||
        resize.event.extendedProps.doc == null
      ) {
        return
      }

      await actionsRef.current.updateDocDate(
        resize.event.extendedProps.doc as any,
        getCleanedDatesWithDuration(resize.event.start, resize.event.end)
      )
    },
    [actionsRef]
  )

  const handleEventReceive = useCallback(
    async (received: { event: EventApi }) => {
      if (
        received.event.start == null ||
        received.event.extendedProps.doc == null
      ) {
        return
      }
      await actionsRef.current.updateDocDate(
        received.event.extendedProps.doc as any,
        [cleanupDateProp(received.event.start)]
      )
      closeAllModals()
    },
    [actionsRef, closeAllModals]
  )

  return (
    <Container className='view view--calendar'>
      <Flexbox justifyContent='space-between' alignItems='center'>
        {viewsSelector}
        <Flexbox flex='0 0 auto'>
          <Button
            variant='transparent'
            className='view--calendar__watched'
            onClick={(event) =>
              openContextModal(
                event,
                <CalendarWatchedPropContext
                  view={view}
                  teamId={team.id}
                  watchedProp={watchedProp}
                  updateWatchedProp={actionsRef.current.updateWatchedProp}
                />,
                {
                  width: 250,
                  removePadding: true,
                }
              )
            }
          >
            <Flexbox>
              <span>By</span>
              <Icon
                path={
                  getIconPathOfPropType(watchedProp.type) ||
                  mdiCalendarMonthOutline
                }
              />
              <span>{watchedProp.name}</span>
            </Flexbox>
          </Button>
          <Button
            variant='transparent'
            disabled={noDateDocs.length === 0}
            iconPath={mdiFileDocumentOutline}
            onClick={(event) =>
              openContextModal(
                event,
                <CalendarNoDateContext
                  team={team}
                  docs={noDateDocs}
                  currentUserIsCoreMember={currentUserIsCoreMember}
                />,
                {
                  width: 250,
                  removePadding: true,
                  onBlur: true,
                }
              )
            }
          >
            No Date ({noDateDocs.length})
          </Button>
          <Button variant='transparent' disabled={true}>
            Columns
          </Button>
        </Flexbox>
      </Flexbox>
      <Calendar
        dayHeaderFormat={{ weekday: 'long' }}
        selectable={currentUserIsCoreMember}
        editable={currentUserIsCoreMember}
        eventContent={CalendarEventItem}
        events={docEvents}
        select={handleNewDateSelection}
        eventChange={handleEventChange}
        eventReceive={handleEventReceive}
        droppable={false}
        headerToolbar={{
          start: undefined,
          center: 'prev,title,next',
          end: 'today',
        }}
      />
    </Container>
  )
}

function getCleanedDatesWithDuration(start: Date, end?: Date | null) {
  const dates = [start]
  if (
    end != null &&
    intervalToDuration({ start: start, end: end }).days !== 1
  ) {
    const endDate = end
    endDate.setDate(endDate.getDate() - 1)
    dates.push(endDate)
  }

  return dates.map((date) => cleanupDateProp(date))
}

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;

  .view--calendar__watched {
    .icon {
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
      margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
  }

  .sorting-options__select .form__select__single-value {
    display: flex;
  }

  .fc .fc-highlight {
    background: ${({ theme }) => theme.colors.background.tertiary};
    opacity: 0.2;
  }

  .fc-header-toolbar {
    width: 98%;
    margin: auto;
    display: flex;
    align-items: center;

    .fc-toolbar-chunk > div {
      display: flex;
      align-items: center;

      .fc-toolbar-title {
        margin: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
      }
    }
  }

  .fc .fc-daygrid-day.fc-day-today {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  .fc .fc-daygrid-day {
    position: relative;
  }
  .fc .fc-daygrid-day:hover::before {
    content: '+';
    position: absolute;
    top: 2px;
    left: 2px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .fc-theme-standard td,
  .fc-theme-standard th {
    border-color: ${({ theme }) => theme.colors.border.second};
  }

  .fc-theme-standard .fc-scrollgrid {
    border-width: 0;
  }

  .fc-theme-standard th {
    border-left: 0;
    border-right: 0;
    a {
      text-transform: uppercase;
      color: ${({ theme }) => theme.colors.text.subtle};
      font-weight: 400;
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
    }
  }

  .fc-h-event {
    border-color: ${({ theme }) => theme.colors.border.main};
  }

  .fc .fc-button-primary {
    background-color: ${({ theme }) => theme.colors.variants.primary.base};
    color: ${({ theme }) => theme.colors.variants.primary.text};
    border: 0 !important;
    outline: 0 !important;

    &:focus {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.variants.info.base} !important;
    }

    .button__spinner {
      border-color: ${({ theme }) => theme.colors.variants.primary.text};
      border-right-color: transparent;
    }

    &:not(:disabled) {
      &.focus {
        background-color: ${({ theme }) => theme.colors.variants.primary.base};
        filter: brightness(103%);
      }
      &:hover {
        background-color: ${({ theme }) => theme.colors.variants.primary.base};
        filter: brightness(106%);
      }
      &:active,
      &.button__state--active {
        background-color: ${({ theme }) => theme.colors.variants.primary.base};
        filter: brightness(112%);
      }
    }
  }
`

export default CalendarView
