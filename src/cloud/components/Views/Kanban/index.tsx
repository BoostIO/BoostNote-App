import React, { useEffect } from 'react'
import Kanban from '../../../../design/components/organisms/Kanban'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { useKanbanView } from '../../../lib/hooks/views/kanbanView'
import { getDocTitle } from '../../../lib/utils/patterns'

interface KanbanViewProps {
  docs: SerializedDocWithSupplemental[]
}

const view: any = {
  id: 1,
  name: 'kanban',
  type: 'kanban' as const,
  data: {
    statusProp: 'Status',
    lists: [
      { id: '1', order: '', ordering: {} },
      { id: '2', order: '', ordering: {} },
      { id: '3', order: '', ordering: {} },
      { id: '4', order: '', ordering: {} },
    ],
  },
  order: '',
}

// kanban lib, kanban hook
const KanbanView = ({ docs }: KanbanViewProps) => {
  const { lists, onItemMove, onListMove } = useKanbanView({ view, docs })

  return (
    <Kanban
      lists={lists}
      onItemMove={onItemMove}
      onListMove={onListMove}
      onItemCreate={console.log}
      renderItem={(doc) => (
        <div>
          <p style={{ margin: 0 }}>{getDocTitle(doc)}</p>
        </div>
      )}
    />
  )
}

export default KanbanView
