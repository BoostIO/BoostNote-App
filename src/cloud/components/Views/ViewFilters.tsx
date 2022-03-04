import React, { useState } from 'react'
import Form from '../../../design/components/molecules/Form'
import styled from '../../../design/lib/styled'
import { useEffectOnUnmount } from '../../../lib/hooks'
import { SerializedQuery } from '../../interfaces/db/smartView'
import { EditableQuery } from '../Modal/contents/SmartView/interfaces'
import SmartViewConditionRows from '../Modal/contents/SmartView/SmartViewConditionRows'

interface ViewFiltersContextProps {
  teamId: string
  filters?: SerializedQuery
  sendFilters: (query: SerializedQuery) => void
}

const ViewFiltersContext = ({
  teamId,
  filters: initialFilters = [],
  sendFilters,
}: ViewFiltersContextProps) => {
  const [filters, setFilters] = useState<EditableQuery>(
    initialFilters as EditableQuery
  )

  useEffectOnUnmount(() => {
    sendFilters(cleanupFilters(filters))
  })

  return (
    <Container>
      <Form>
        <SmartViewConditionRows
          teamId={teamId}
          conditions={filters}
          setConditions={setFilters}
        />
      </Form>
    </Container>
  )
}

const Container = styled.div`
  .form__row__items:first-of-type > .flexbox:first-of-type {
    align-items: center;
  }
`

export default ViewFiltersContext

function cleanupFilters(filter?: EditableQuery): SerializedQuery {
  if (filter == null) {
    return []
  }

  return filter.filter(
    (condition) => (condition.type as string) !== 'null'
  ) as SerializedQuery
}
