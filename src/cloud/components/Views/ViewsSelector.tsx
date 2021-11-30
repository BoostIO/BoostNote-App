import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiDotsHorizontal,
  mdiPlus,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import ButtonGroup from '../../../design/components/atoms/ButtonGroup'
import Spinner from '../../../design/components/atoms/Spinner'
import UpDownList from '../../../design/components/atoms/UpDownList'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
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
import { getIconPathOfViewType } from '../../lib/views'

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
            iconPath={getIconPathOfViewType(view.type)}
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
        size='sm'
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
  padding-top: ${({ theme }) => theme.sizes.spaces.df}px;
  padding-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;

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
  const compositionStateRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState<'before' | 'after' | 'name'>()
  const [value, setValue] = useState(view.name)
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
      setSending(move)
      const res = await actionsRef.current.moveView(view, move)
      setSending(undefined)
      if (!res.err) {
        closeLastModal()
      }
    },
    [closeLastModal, actionsRef]
  )

  const renameView = useCallback(
    async (view: SerializedView, newName: string) => {
      setSending('name')
      const res = await actionsRef.current.updateView(view, { name: newName })
      setSending(undefined)
      if (!res.err) {
        closeLastModal()
      }
    },
    [closeLastModal, actionsRef]
  )

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  return (
    <StyledContainer>
      <MetadataContainerRow row={{ type: 'header', content: 'Name' }} />
      <MetadataContainerRow
        row={{
          type: 'content',
          content:
            sending === 'name' ? (
              <Spinner />
            ) : (
              <FormInput
                className='view__name__input'
                id='view__name__input'
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onCompositionStart={() => {
                  compositionStateRef.current = true
                }}
                onCompositionEnd={() => {
                  compositionStateRef.current = false
                  if (inputRef.current != null) {
                    inputRef.current.focus()
                  }
                }}
                onKeyPress={(event) => {
                  if (compositionStateRef.current) {
                    return
                  }
                  switch (event.key) {
                    case 'Enter':
                      event.preventDefault()
                      renameView(view, value)
                      return
                  }
                }}
              />
            ),
        }}
      />
      <MetadataContainerBreak />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            id: 'metadata-move-left',
            label: 'Move left',
            iconPath: mdiArrowLeft,
            spinning: sending === 'before',
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
            spinning: sending === 'after',
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
    </StyledContainer>
  )
}

const StyledContainer = styled(MetadataContainer)`
  .view__name__input {
    width: 100%;
  }
`

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
        icon={{ type: 'icon', path: getIconPathOfViewType('table') }}
        label={'Table'}
        labelClick={() => createNewView('table')}
      />
      <NavigationItem
        id={`view__modal--table`}
        borderRadius={true}
        icon={{ type: 'icon', path: getIconPathOfViewType('kanban') }}
        label={'Kanban'}
        labelClick={() => createNewView('kanban')}
      />
      <NavigationItem
        id={`view__modal--table`}
        borderRadius={true}
        icon={{ type: 'icon', path: getIconPathOfViewType('calendar') }}
        label={'Calendar'}
        labelClick={() => createNewView('calendar')}
      />
    </UpDownList>
  )
}
export default ViewsSelector
