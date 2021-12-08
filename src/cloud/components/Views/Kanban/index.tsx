import {
  mdiArrowDownDropCircleOutline,
  mdiDotsHorizontal,
  mdiPlus,
} from '@mdi/js'
import React, { useCallback, useEffect, useRef } from 'react'
import Button from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import { Label } from '../../../../design/components/atoms/Label'
import Kanban from '../../../../design/components/organisms/Kanban'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedView } from '../../../interfaces/db/view'
import { useKanbanView } from '../../../lib/hooks/views/kanbanView'
import { useStatuses } from '../../../lib/stores/status'
import { StatusSelector } from '../../Props/Pickers/StatusSelect'
import Item from './Item'

interface KanbanViewProps {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  team: SerializedTeam
  viewsSelector: React.ReactNode
}

const KanbanView = ({
  view,
  docs,
  currentUserIsCoreMember,
  team,
  viewsSelector,
}: KanbanViewProps) => {
  const {
    state: { statuses },
  } = useStatuses(team.id)
  const { prop, lists, onItemMove, onListMove, addList } = useKanbanView({
    view,
    docs,
  })
  const { openContextModal, closeLastModal } = useModal()

  const addListRef = useRef(addList)
  useEffect(() => {
    addListRef.current = addList
  }, [addList])
  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <StatusSelector
          onSelect={(status) => {
            addListRef.current(status?.id.toString() || 'none')
            closeLastModal()
          }}
        />,
        { width: 200, removePadding: true }
      )
    },
    [openContextModal, closeLastModal]
  )

  const renderHeader = useCallback(
    (list: typeof lists[number]) => {
      const id = Number(list.id)
      const status = statuses.find((status) => status.id === id)
      return (
        <Flexbox justifyContent='space-between'>
          <Label
            name={status?.name || 'No Status'}
            backgroundColor={status?.backgroundColor}
          />
          <Button iconPath={mdiDotsHorizontal} variant='icon'></Button>
        </Flexbox>
      )
    },
    [statuses]
  )

  const renderItem = useCallback((doc: SerializedDocWithSupplemental) => {
    return <Item doc={doc} />
  }, [])

  return (
    <Container className='view view--kanban'>
      <Flexbox justifyContent='space-between' alignItems='center'>
        {viewsSelector}
        <Flexbox flex='0 0 auto'>
          <Button
            disabled={!currentUserIsCoreMember}
            variant='transparent'
            className='view--kanban__prop'
            onClick={(event) =>
              openContextModal(event, <div></div>, {
                width: 250,
                removePadding: true,
              })
            }
          >
            <Flexbox>
              <span>By</span>
              <Icon path={mdiArrowDownDropCircleOutline} />
              <span>{prop}</span>
            </Flexbox>
          </Button>
          <Button variant='transparent' disabled={true}>
            Columns
          </Button>
        </Flexbox>
      </Flexbox>
      <Kanban
        disabled={!currentUserIsCoreMember}
        className='view--kanban--board'
        lists={lists}
        onItemMove={onItemMove}
        onListMove={onListMove}
        renderHeader={renderHeader}
        renderItem={renderItem}
        afterLists={
          <div>
            <Button
              disabled={!currentUserIsCoreMember}
              onClick={openSelector}
              iconPath={mdiPlus}
              variant='transparent'
            >
              Add Status
            </Button>
          </div>
        }
      />
    </Container>
  )
}

export default KanbanView

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
`
