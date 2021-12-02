import React, { useCallback, useMemo, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getDocTitle } from '../../../lib/utils/patterns'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../design/lib/utils/array'
import { usePreferences } from '../../../lib/stores/preferences'
import SortingOption, {
  sortingOrders,
} from '../../ContentManager/SortingOption'
import { FormSelectOption } from '../../../../design/components/molecules/Form/atoms/FormSelect'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Button from '../../../../design/components/atoms/Button'
import { useCalendarView } from '../../../lib/hooks/views/calendarView'
import Calendar from '../../../../design/components/organisms/Calendar'
import CalendarEventItem from './CalendarEventItem'
import { useRouter } from '../../../lib/router'
import { EventSourceInput } from '@fullcalendar/react'
import { isArray } from 'lodash'
import { filterIter } from '../../../lib/utils/iterator'
import { useModal } from '../../../../design/lib/stores/modal'
import CalendarEventItemContextMenu from './CalendarEventItemContextMenu'

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
}: CalendarViewProps) => {
  const { push } = useRouter()
  const { preferences, setPreferences } = usePreferences()
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
    preferences.folderSortingOrder
  )
  const { openContextModal } = useModal()

  const { watchedProp } = useCalendarView({
    view,
  })

  const orderedDocs = useMemo(() => {
    const docsWithTitle = docs.map((doc) => {
      return {
        ...doc,
        title: getDocTitle(doc, 'untitled'),
      }
    })
    switch (order) {
      case 'Title A-Z':
        return sortByAttributeAsc('title', docsWithTitle)
      case 'Title Z-A':
        return sortByAttributeDesc('title', docsWithTitle)
      case 'Latest Updated':
      default:
        return sortByAttributeDesc('updatedAt', docsWithTitle)
    }
  }, [order, docs])

  const docEvents: EventSourceInput = useMemo(() => {
    return orderedDocs.map((doc) => {
      const dateProps = (doc.props || {})[watchedProp.name]

      const props = {
        start: undefined,
        end: undefined,
        date: undefined,
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
            props.end = orderedDates[1]
          }
        }
      }
      return {
        title: getDocTitle(doc, 'Untitled'),
        ...props,
        extendedProps: {
          doc,
          team,
          push,
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
  }, [orderedDocs, push, team, watchedProp, openContextModal])

  const noDateDocs = useMemo(() => {
    return filterIter(
      (doc) =>
        (doc.props || {})[watchedProp.name] == null ||
        (doc.props || {})[watchedProp.name].data == null ||
        (doc.props || {})[watchedProp.name].type !== watchedProp.type,
      orderedDocs
    )
  }, [watchedProp, orderedDocs])

  const createDocument = useCallback(() => {}, [])

  const onChangeOrder = useCallback(
    (val: FormSelectOption) => {
      setOrder(val.value)
      setPreferences({ folderSortingOrder: val.value as any })
    },
    [setPreferences]
  )

  console.log(docEvents)
  return (
    <Container className='view view--calendar'>
      <Flexbox justifyContent='space-between' alignItems='center'>
        {viewsSelector}
        <Flexbox flex='0 0 auto'>
          <SortingOption value={order} onChange={onChangeOrder} />
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
        headerToolbar={{
          start: undefined,
          center: 'prev,title,next',
          end: 'today',
        }}
      />
    </Container>
  )
}

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;

  .sorting-options__select .form__select__single-value {
    display: flex;
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
