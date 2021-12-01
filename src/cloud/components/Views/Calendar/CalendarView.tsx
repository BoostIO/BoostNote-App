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
import { StyledContentManagerList } from '../../ContentManager/styled'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Button from '../../../../design/components/atoms/Button'
import { useCalendarView } from '../../../lib/hooks/views/calendarView'

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
      <StyledContentManagerList>
        <Flexbox justifyContent='space-between' alignItems='center'>
          {viewsSelector}
          <Flexbox flex='0 0 auto'>
            <SortingOption value={order} onChange={onChangeOrder} />
            <Button variant='transparent' disabled={true}>
              Columns
            </Button>
          </Flexbox>
        </Flexbox>
      </StyledContentManagerList>
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
`

export default CalendarView
