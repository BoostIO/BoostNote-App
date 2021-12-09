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
import { useRouter } from '../../../lib/router'
import { useStatuses } from '../../../lib/stores/status'
import { getDocLinkHref } from '../../Link/DocLink'
import { StatusSelector } from '../../Props/Pickers/StatusSelect'
import Item from './Item'
import KanbanWatchedPropSetter from './KanbanWatchedPropSetter'
import ListSettings from './ListSettings'

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
  const {
    prop,
    lists,
    onItemMove,
    onListMove,
    removeList,
    addList,
    setProp,
  } = useKanbanView({
    view,
    docs,
  })
  const { openContextModal, closeLastModal } = useModal()
  const { push } = useRouter()

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

  const removeListRef = useRef(removeList)
  useEffect(() => {
    removeListRef.current = removeList
  })

  const onListMoveRef = useRef(onListMove)
  useEffect(() => {
    onListMoveRef.current = onListMove
  })

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
          <Button
            onClick={(event) => {
              openContextModal(
                event,
                <ListSettings
                  list={list}
                  remove={(list) => {
                    removeListRef.current(list)
                    closeLastModal()
                  }}
                  move={(list, move) => {
                    onListMoveRef.current(list, move)
                    closeLastModal()
                  }}
                />,
                {
                  width: 250,
                  removePadding: true,
                }
              )
            }}
            iconPath={mdiDotsHorizontal}
            variant='icon'
          ></Button>
        </Flexbox>
      )
    },
    [statuses, openContextModal, closeLastModal]
  )

  const renderItem = useCallback(
    (doc: SerializedDocWithSupplemental) => {
      return (
        <Item
          onClick={() => push(getDocLinkHref(doc, team, 'index'))}
          doc={doc}
        />
      )
    },
    [team, push]
  )

  const setPropRef = useRef(setProp)
  useEffect(() => {
    setPropRef.current = setProp
  }, [setProp])

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
              openContextModal(
                event,
                <KanbanWatchedPropSetter
                  prop={prop}
                  teamId={team.id}
                  view={view}
                  setProp={(str) => {
                    setPropRef.current(str)
                    closeLastModal()
                  }}
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
              <Icon path={mdiArrowDownDropCircleOutline} />
              <span>{prop}</span>
            </Flexbox>
          </Button>
        </Flexbox>
      </Flexbox>
      <div className='view--kanban__wrapper'>
        <Kanban
          disabled={!currentUserIsCoreMember}
          className='view--kanban--board'
          lists={lists}
          onItemMove={onItemMove}
          onListMove={onListMove}
          renderHeader={renderHeader}
          renderItem={renderItem}
          afterLists={
            <Button
              disabled={!currentUserIsCoreMember}
              onClick={openSelector}
              iconPath={mdiPlus}
              variant='transparent'
              className='view--kanban--board__add-btn'
            >
              Add Status
            </Button>
          }
        />
      </div>
    </Container>
  )
}

export default KanbanView

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;

  .view--kanban__wrapper {
    padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  }

  .view--kanban--board__add-btn {
    flex-wrap: nowrap;
    margin: ${({ theme }) => theme.sizes.spaces.sm}px;
    white-space: nowrap;
  }
`
