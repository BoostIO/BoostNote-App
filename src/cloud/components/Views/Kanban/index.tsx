import React, { useState } from 'react'
import Kanban from '../../../../design/components/organisms/Kanban'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { getDocTitle } from '../../../lib/utils/patterns'

interface KanbanViewProps {
  docs: SerializedDocWithSupplemental[]
}

const KanbanView = ({ docs }: KanbanViewProps) => {
  const [lists, setLists] = useState(() => {
    return [
      {
        id: 'a',
        items: docs.slice(0, Math.floor(Math.max(1, docs.length) / 2)),
      },
      { id: 'b', items: docs.slice(Math.floor(Math.max(1, docs.length) / 2)) },
    ]
  })

  return (
    <Kanban
      lists={lists}
      renderItem={(doc) => (
        <div>
          <p>{getDocTitle(doc)}</p>
        </div>
      )}
      onItemMove={console.log}
      onListMove={console.log}
      onItemCreate={console.log}
      onItemSort={console.log}
    />
  )
}

export default KanbanView
