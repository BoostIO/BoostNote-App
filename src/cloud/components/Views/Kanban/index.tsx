import {
  mdiArrowDownDropCircleOutline,
  mdiDotsHorizontal,
  mdiPlus,
} from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import Button from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import { Label } from '../../../../design/components/atoms/Label'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'
import { StatusEditor } from '../../../../design/components/molecules/LabelManager'
import Kanban from '../../../../design/components/organisms/Kanban'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useCloudResourceModals } from '../../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../../lib/hooks/useI18n'
import MetadataContainerBreak from '../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import {
  KanbanViewList,
  useKanbanView,
} from '../../../lib/hooks/views/kanbanView'
import { lngKeys } from '../../../lib/i18n/types'
import { useStatuses } from '../../../lib/stores/status'
import { KanbanViewData } from '../../../lib/views/kanban'
import { StatusSelector } from '../../Props/Pickers/StatusSelect'
import Item from './Item'
import KanbanViewPropertiesContext from './KanbanViewPropertiesContext'
import KanbanWatchedPropSetter from './KanbanWatchedPropSetter'
import ListSettings from './ListSettings'
import ViewFiltersContext from '../ViewFilters'
import { buildSmartViewQueryCheck } from '../../../lib/smartViews'

interface KanbanViewProps {
  view: SerializedView<KanbanViewData>
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  team: SerializedTeam
  viewsSelector: React.ReactNode
  currentWorkspaceId?: string
  currentFolderId?: string
}

const KanbanView = ({
  view,
  docs: unfilteredDocs,
  currentUserIsCoreMember,
  team,
  viewsSelector,
  currentWorkspaceId,
  currentFolderId,
}: KanbanViewProps) => {
  const {
    state: { statuses },
    editStatus,
  } = useStatuses(team.id)

  const docs = useMemo(() => {
    if (view.data.filter == null || view.data.filter.length === 0) {
      return unfilteredDocs
    }

    return unfilteredDocs.filter(buildSmartViewQueryCheck(view.data.filter))
  }, [unfilteredDocs, view.data.filter])

  const {
    prop,
    lists,
    onItemMove,
    onListMove,
    removeList,
    addList,
    setProp,
    setProperties,
    setFilters,
  } = useKanbanView({
    view,
    docs,
  })
  const { openContextModal, closeLastModal } = useModal()
  const { createDoc } = useCloudApi()
  const { translate } = useI18n()
  const { goToDocPreview, openNewDocForm } = useCloudResourceModals()
  const isViewEditable = currentUserIsCoreMember || view.smartViewId != null

  const addListRef = useRef(addList)
  useEffect(() => {
    addListRef.current = addList
  }, [addList])

  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <StatusSelector
          readOnly={!currentUserIsCoreMember}
          ignoredStatuses={lists.map((list) => list.id)}
          onSelect={(status) => {
            addListRef.current(status?.id.toString() || 'none')
            closeLastModal()
          }}
        />,
        { width: 200, removePadding: true, keepAll: true }
      )
    },
    [openContextModal, closeLastModal, currentUserIsCoreMember, lists]
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
      const statusProp =
        list.id !== 'none'
          ? statuses.find((status) => status.id === parseInt(list.id))
          : undefined
      return (
        <Flexbox
          justifyContent='space-between'
          className='kanban__item--header'
        >
          <Label
            name={status?.name || 'No Status'}
            backgroundColor={status?.backgroundColor}
          />
          {isViewEditable && (
            <div className={'kanban__item--action-buttons'}>
              {currentWorkspaceId != null && currentUserIsCoreMember && (
                <Button
                  className={'kanban__item--action-button'}
                  variant={'icon'}
                  iconPath={mdiPlus}
                  onClick={() => {
                    openNewDocForm(
                      {
                        team,
                        workspaceId: currentWorkspaceId,
                        parentFolderId: currentFolderId,
                        props:
                          statusProp != null
                            ? {
                                [prop]: {
                                  type: 'status',
                                  data: statusProp.id,
                                },
                              }
                            : undefined,
                      },
                      {
                        precedingRows: [],
                        skipRedirect: true,
                      }
                    )
                  }}
                />
              )}
              <Button
                className={'kanban__item--action-button'}
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
                    >
                      {status != null && (
                        <>
                          <StatusEditor
                            type='status'
                            label={status}
                            onSave={(status) => editStatus(status)}
                            readOnly={!currentUserIsCoreMember}
                          />
                          <MetadataContainerBreak />
                        </>
                      )}
                    </ListSettings>,
                    {
                      width: 250,
                      removePadding: true,
                      keepAll: true,
                    }
                  )
                }}
                iconPath={mdiDotsHorizontal}
                variant='icon'
              />
            </div>
          )}
        </Flexbox>
      )
    },
    [
      statuses,
      openContextModal,
      editStatus,
      team,
      currentWorkspaceId,
      currentFolderId,
      prop,
      closeLastModal,
      openNewDocForm,
      currentUserIsCoreMember,
      isViewEditable,
    ]
  )

  const renderItem = useCallback(
    (doc: SerializedDocWithSupplemental) => {
      return (
        <Item
          onClick={() => goToDocPreview(doc)}
          doc={doc}
          displayedProps={view.data.props || {}}
        />
      )
    },
    [goToDocPreview, view.data.props]
  )

  const renderListFooter = useCallback(
    (list: KanbanViewList) => {
      if (currentWorkspaceId == null) {
        return null
      }

      const status =
        list.id !== 'none'
          ? statuses.find((status) => status.id === parseInt(list.id))
          : undefined
      return (
        <FormToggableInput
          className='kanban__list__footer'
          iconPath={mdiPlus}
          variant='bordered'
          label={translate(lngKeys.ModalsCreateNewDocument)}
          submit={(val: string) =>
            createDoc(
              team,
              {
                title: val,
                workspaceId: currentWorkspaceId,
                parentFolderId: currentFolderId,
                props:
                  status != null
                    ? {
                        [prop]: {
                          type: 'status',
                          data: status.id,
                        },
                      }
                    : undefined,
              },
              {
                skipRedirect: true,
              }
            )
          }
        />
      )
    },
    [
      createDoc,
      translate,
      prop,
      statuses,
      team,
      currentFolderId,
      currentWorkspaceId,
    ]
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
            variant='transparent'
            active={view.data.filter != null && view.data.filter.length > 0}
            onClick={(ev) =>
              openContextModal(
                ev,
                <ViewFiltersContext
                  teamId={team.id}
                  sendFilters={setFilters}
                  filters={view.data.filter}
                />,
                {
                  width: 800,
                  alignment: 'bottom-right',
                }
              )
            }
          >
            Filter
          </Button>
          <Button
            disabled={!isViewEditable}
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
                  keepAll: true,
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

          <Button
            variant='transparent'
            onClick={(event) =>
              openContextModal(
                event,
                <KanbanViewPropertiesContext
                  view={view}
                  teamId={team.id}
                  properties={view.data.props}
                  isViewEditable={isViewEditable}
                  setProperties={setProperties}
                />,
                {
                  width: 250,
                  removePadding: true,
                  keepAll: true,
                }
              )
            }
          >
            Properties
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
          afterItems={renderListFooter}
          afterLists={
            <Button
              disabled={!isViewEditable}
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

  .view--kanban--board__add-btn {
    flex-wrap: nowrap;
    margin: ${({ theme }) => theme.sizes.spaces.sm}px;
    white-space: nowrap;
  }

  .kanban__item--header > span:hover {
    cursor: grab;
  }

  .kanban__item--header {
    .kanban__item--action-button {
      padding: 1px;
    }
  }

  .kanban__list__footer,
  .kanban__list__footer > button,
  .kanban__list__footer > input {
    width: 100%;
    justify-content: flex-start;
  }

  .kanban__item,
  .kanban__list__footer,
  .kanban__list__footer > button,
  .kanban__list__footer > input {
    height: 40px;
    min-height: 40px;
  }

  .kanban__item,
  .kanban__item .navigation__item {
    height: auto !important;
    min-height: 40px !important;
    border-radius: 3px;
  }

  .kanban__item .navigation__item {
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
  }

  .kanban__item__wrapper {
    height: 100%;
    background: ${({ theme }) => theme.colors.background.secondary} !important;
  }

  .kanban__item,
  .kanban__list__footer {
    margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
  }
`
