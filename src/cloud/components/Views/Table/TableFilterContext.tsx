import React, { useEffect, useState } from 'react'
import Form from '../../../../design/components/molecules/Form'
import styled from '../../../../design/lib/styled'
import { SerializedQuery } from '../../../interfaces/db/dashboard'
import DashboardConditionRows from '../../Modal/contents/Dashboard/DashboardConditionRows'
import { EditableQuery } from '../../Modal/contents/Dashboard/interfaces'

interface TableFilterContextProps {
  filters?: SerializedQuery
  sendFilters: (query: SerializedQuery) => void
}

const TableFilterContext = ({
  filters: initialFilters = [],
  sendFilters,
}: TableFilterContextProps) => {
  const [filters, setFilters] = useState<EditableQuery>(
    initialFilters as EditableQuery
  )

  useEffect(() => {
    sendFilters(cleanupFilters(filters))
  }, [filters, sendFilters])

  return (
    <Container>
      <Form>
        <DashboardConditionRows
          conditions={filters}
          setConditions={setFilters}
        />
      </Form>
    </Container>
  )
}

const Container = styled.div``

export default TableFilterContext

function cleanupFilters(filter?: EditableQuery): SerializedQuery {
  if (filter == null) {
    return []
  }

  return filter.filter(
    (condition) => (condition.type as string) !== 'null'
  ) as SerializedQuery
}
