import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiDotsHorizontal,
  mdiPlus,
  mdiTable,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import ButtonGroup from '../../../design/components/atoms/ButtonGroup'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import {
  SerializedView,
  SupportedViewTypes,
  ViewParent,
} from '../../interfaces/db/view'
import { useViewHandler } from '../../lib/hooks/views/viewHandler'
import { sortByLexorankProperty } from '../../lib/utils/string'

export interface ViewsSelectorProps {
  selectedViewId: number | undefined
  setSelectedViewId: (id: number) => void
  views: SerializedView[]
  parent: ViewParent
}

const ViewsSelector = ({
  views,
  parent,
  selectedViewId,
  setSelectedViewId,
}: ViewsSelectorProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const { actionsRef, sendingMap } = useViewHandler({
    parent,
    selectNewView: setSelectedViewId,
  })

  const createNewView = useCallback(
    async (type: SupportedViewTypes) => {
      closeLastModal()
      return actionsRef.current.createNewView(type)
    },
    [closeLastModal, actionsRef]
  )

  const orderedViews = useMemo(() => {
    return sortByLexorankProperty(views, 'order')
  }, [views])

  return (
    <Container className='views__selector'>
      {orderedViews.map((view) => (
        <ButtonGroup className='views__item' key={view.id}>
          <Button
            id={`view--${view.id}`}
            variant='icon'
            iconPath={view.type === 'table' ? mdiTable : undefined}
            iconSize={20}
            onClick={() => setSelectedViewId(view.id)}
            active={selectedViewId === view.id}
            size='sm'
          >
            {view.name}
          </Button>
          <Button
            variant='icon'
            iconPath={mdiDotsHorizontal}
            size='sm'
            className='views__item__menu'
            onClick={(ev) =>
              openContextModal(
                ev,
                <ViewContextModal
                  view={view}
                  parent={parent}
                  setSelectedViewId={setSelectedViewId}
                />,
                {
                  removePadding: true,
                  width: 300,
                }
              )
            }
          />
        </ButtonGroup>
      ))}
      <LoadingButton
        spinning={sendingMap.get('view-api') === 'create'}
        disabled={sendingMap.has('view-api')}
        variant='icon'
        iconPath={mdiPlus}
        iconSize={20}
        onClick={(ev) =>
          openContextModal(ev, <ViewModal createNewView={createNewView} />, {
            alignment: 'bottom-left',
            width: 300,
          })
        }
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.sizes.spaces.df}px;

  .views__item {
    align-items: center;
    display: inline-flex;
    button {
      padding: 0;
    }
    .views__item__menu {
      opacity: 0;
      pointer-events: none;
    }

    &:hover {
      .views__item__menu {
        opacity: 1;
        pointer-events: initial;
      }
    }
  }

  .views__item + .views__item {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

const ViewContextModal = ({
  view,
  parent,
  setSelectedViewId,
}: {
  view: SerializedView
  parent: ViewParent
  setSelectedViewId: (id: number) => void
}) => {
  const { closeLastModal } = useModal()
  const { actionsRef, sendingMap } = useViewHandler({
    parent,
    selectNewView: setSelectedViewId,
  })

  const deleteView = useCallback(
    async (view: SerializedView) => {
      const res = await actionsRef.current.deleteView(view)
      if (!res.err) {
        closeLastModal()
      }
    },
    [closeLastModal, actionsRef]
  )

  const moveView = useCallback(
    async (view: SerializedView, move: 'before' | 'after') => {
      const res = await actionsRef.current.moveView(view, move)
      if (!res.err) {
        closeLastModal()
      }
    },
    [closeLastModal, actionsRef]
  )

  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-move-left',
            label: 'Move left',
            iconPath: mdiArrowLeft,
            spinning: sendingMap.get(view.id.toString()) === 'update',
            disabled: sendingMap.has(view.id.toString()),
            onClick: () => moveView(view, 'before'),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-move-right',
            label: 'Move right',
            iconPath: mdiArrowRight,
            spinning: sendingMap.get(view.id.toString()) === 'update',
            disabled: sendingMap.has(view.id.toString()),
            onClick: () => moveView(view, 'after'),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-delete-view',
            label: 'Delete',
            iconPath: mdiTrashCanOutline,
            spinning: sendingMap.get(view.id.toString()) === 'delete',
            disabled: sendingMap.has(view.id.toString()),
            onClick: () => deleteView(view),
          },
        }}
      />
    </MetadataContainer>
  )
}

const ViewModal = ({
  createNewView,
}: {
  createNewView: (type: SupportedViewTypes) => void
}) => {
  return (
    <UpDownList>
      <NavigationItem
        id={`view__modal--table`}
        borderRadius={true}
        icon={{ type: 'icon', path: mdiTable }}
        label={'Table'}
        labelClick={() => createNewView('table')}
      />
      <NavigationItem
        id={`view__modal--table`}
        borderRadius={true}
        icon={{ type: 'icon', path: mdiTable }}
        label={'Kanban'}
        labelClick={() => createNewView('kanban')}
      />
      <NavigationItem
        id={`view__modal--table`}
        borderRadius={true}
        icon={{ type: 'icon', path: mdiTable }}
        label={'Calendar'}
        labelClick={() => createNewView('calendar')}
      />
    </UpDownList>
  )
}
export default ViewsSelector
