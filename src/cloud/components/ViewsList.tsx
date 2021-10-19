import { mdiPlus, mdiTable, mdiTrashCanOutline } from '@mdi/js'
import { capitalize } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button, { LoadingButton } from '../../design/components/atoms/Button'
import Flexbox from '../../design/components/atoms/Flexbox'
import UpDownList from '../../design/components/atoms/UpDownList'
import NavigationItem from '../../design/components/molecules/Navigation/NavigationItem'
import { useModal } from '../../design/lib/stores/modal'
import styled from '../../design/lib/styled'
import { SerializedView, SupportedViewTypes } from '../interfaces/db/view'
import { useCloudApi } from '../lib/hooks/useCloudApi'

interface ViewsListProps {
  views: SerializedView[]
  parent: { folder: string } | { dashboard: string }
}

const ViewsList = ({ views, parent }: ViewsListProps) => {
  const [selectedViewId, setSelectedViewId] = useState<number>()
  const { openContextModal, closeAllModals } = useModal()
  const { createViewApi, sendingMap, deleteViewApi } = useCloudApi()
  const [sending, setSending] = useState(false)

  const currentView = useMemo(() => {
    if (selectedViewId == null) {
      return undefined
    }

    return views.find((view) => view.id === selectedViewId)
  }, [selectedViewId, views])

  const createNewView = useCallback(
    async (type: SupportedViewTypes) => {
      closeAllModals()
      setSending(true)
      await createViewApi(Object.assign({}, parent, { type }))
      setSending(false)
    },
    [closeAllModals, parent, createViewApi]
  )

  useEffectOnce(() => {
    if (views.length > 0) {
      setSelectedViewId(views[0].id)
    }
  })

  return (
    <Container className='views__list'>
      <Flexbox justifyContent='space-between' className='views__header'>
        <Flexbox className='views__selector' flex='1 1 auto'>
          {views.map((view) => (
            <Button
              key={view.id}
              id={`view--${view.id}`}
              className='views__item'
              variant='icon'
              iconPath={view.type === 'table' ? mdiTable : undefined}
              iconSize={20}
              onClick={() => setSelectedViewId(view.id)}
              active={selectedViewId === view.id}
            >
              {capitalize(view.type)}
            </Button>
          ))}
          <LoadingButton
            spinning={sending}
            disabled={sending}
            variant='icon'
            iconPath={mdiPlus}
            iconSize={20}
            onClick={(ev) =>
              openContextModal(
                ev,
                <ViewModal createNewView={createNewView} />,
                {
                  alignment: 'bottom-left',
                  width: 300,
                }
              )
            }
          />
        </Flexbox>
        {currentView != null && (
          <Flexbox flex='0 0 auto'>
            <LoadingButton
              spinning={sendingMap.get(currentView.id.toString()) === 'delete'}
              disabled={sendingMap.get(currentView.id.toString()) != null}
              variant='icon'
              iconPath={mdiTrashCanOutline}
              onClick={() => deleteViewApi(currentView)}
            />
          </Flexbox>
        )}
      </Flexbox>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;

  .views__header {
    width: 100%;
  }
`

const ViewModal = ({
  createNewView,
}: {
  createNewView: (type: 'table') => void
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
    </UpDownList>
  )
}

export default ViewsList
