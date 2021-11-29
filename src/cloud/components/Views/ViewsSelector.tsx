import { mdiPlus, mdiTable } from '@mdi/js'
import { capitalize } from 'lodash'
import React, { useCallback, useState } from 'react'
import Button, { LoadingButton } from '../../../design/components/atoms/Button'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import { BulkApiActionRes } from '../../../design/lib/hooks/useBulkApi'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import {
  CreateViewRequestBody,
  CreateViewResponseBody,
} from '../../api/teams/views'
import {
  SerializedView,
  SupportedViewTypes,
  ViewParent,
} from '../../interfaces/db/view'
import { filterIter } from '../../lib/utils/iterator'

export interface ViewsSelectorProps {
  selectedViewId: number | undefined
  setSelectedViewId: (id: number) => void
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
      const viewsOfTheSameType = filterIter((view) => view.type === type, views)
        .length
      const name = `${capitalize(type)}${
        viewsOfTheSameType === 0 ? '' : ` ${viewsOfTheSameType}`
      }`
      const res = await createViewApi(
        parent.type === 'folder'
          ? { folder: parent.target.id, type, name }
          : parent.type === 'workspace'
          ? { workspace: parent.target.id, type, name }
          : { smartView: parent.target.id, type, name }
      )
      setSending(false)
      if (!res.err) {
        setSelectedViewId((res.data as CreateViewResponseBody).data.id)
      }
    },
    [views, closeAllModals, parent, createViewApi, setSelectedViewId]
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
          size='sm'
        >
          {view.name}
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
  margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
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
