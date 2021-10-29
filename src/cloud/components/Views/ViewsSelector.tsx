import { mdiPlus, mdiTable } from '@mdi/js'
import { capitalize } from 'lodash'
import React, { useCallback, useState } from 'react'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import { BulkApiActionRes } from '../../../design/lib/hooks/useBulkApi'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { CreateViewRequestBody } from '../../api/teams/views'
import {
  SerializedView,
  SupportedViewTypes,
  ViewParent,
} from '../../interfaces/db/view'

export interface ViewsSelectorProps {
  selectedViewId: number | undefined
  setSelectedViewId: React.Dispatch<React.SetStateAction<number | undefined>>
  views: SerializedView[]
  parent: ViewParent
  createViewApi: (target: CreateViewRequestBody) => Promise<BulkApiActionRes>
}

const ViewsSelector = ({
  views,
  parent,
  selectedViewId,
  setSelectedViewId,
  createViewApi,
}: ViewsSelectorProps) => {
  const [sending, setSending] = useState(false)
  const { openContextModal, closeAllModals } = useModal()

  const createNewView = useCallback(
    async (type: SupportedViewTypes) => {
      closeAllModals()
      setSending(true)
      await createViewApi(
        parent.type === 'folder'
          ? { folder: parent.target.id, type }
          : { dashboard: parent.target.id, type }
      )
      setSending(false)
    },
    [closeAllModals, parent, createViewApi]
  )

  return (
    <Container className='views__selector'>
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
export default ViewsSelector
