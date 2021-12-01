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

type CalendarViewProps = {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  team: SerializedTeam
  currentWorkspaceId?: string
  currentFolderId?: string
  viewsSelector: React.ReactNode
}

const CalendarView = ({ view, docs, viewsSelector }: CalendarViewProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
    preferences.folderSortingOrder
  )

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

  const onChangeOrder = useCallback(
    (val: FormSelectOption) => {
      setOrder(val.value)
      setPreferences({ folderSortingOrder: val.value as any })
    },
    [setPreferences]
  )

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
        headerToolbar={{
          start: undefined,
          center: 'prev,title,next',
          end: 'today',
        }}
        dayHeaderFormat={{ weekday: 'long' }}
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
