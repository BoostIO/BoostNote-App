import { mdiChevronDown, mdiDotsHorizontal, mdiLock, mdiPlus } from '@mdi/js'
import React, { useMemo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import BorderSeparator from '../../../design/components/atoms/BorderSeparator'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { getMapValues } from '../../../design/lib/utils/array'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { buildSmartViewQueryCheck } from '../../lib/smartViews'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import SmartViewFolderContextMenu from '../SmartViewContextMenu'
import CreateSmartViewModal from '../Modal/contents/SmartView/CreateSmartViewModal'
import UpdateSmartViewModal from '../Modal/contents/SmartView/UpdateSmartViewModal'
import Views from '../Views'
import {
  getSmartViewListPageData,
  SmartViewListPageResponseBody,
} from '../../api/pages/teams/smartViews/list'
import { getDefaultTableView } from '../../lib/views/table'

const SmartViewPage = ({ data }: SmartViewListPageResponseBody) => {
  const [selectedSmartViewId, setSelectedSmartViewId] = useState<string>()
  const { smartViewsMap, docsMap, viewsMap, workspacesMap } = useNav()
  const { openModal, openContextModal, closeAllModals } = useModal()
  const { team, currentUserIsCoreMember } = usePage()

  useEffectOnce(() => {
    if (data.length > 0) {
      setSelectedSmartViewId(data[0].id)
    }
  })

  const selectedSmartView = useMemo(() => {
    if (selectedSmartViewId == null) {
      return undefined
    }

    return smartViewsMap.get(selectedSmartViewId)
  }, [smartViewsMap, selectedSmartViewId])

  const selectedSmartViewViews = useMemo(() => {
    if (selectedSmartView == null) {
      return []
    }

    const views = getMapValues(viewsMap).filter(
      (view) => view.smartViewId === selectedSmartView.id
    )

    if (views.length === 0) {
      return [
        getDefaultTableView({ target: selectedSmartView, type: 'smartView' }),
      ]
    }

    return views
  }, [viewsMap, selectedSmartView])

  const selectedSmartViewDocs = useMemo(() => {
    if (selectedSmartView == null || selectedSmartView.condition.length === 0) {
      return []
    }
    const docs = getMapValues(docsMap)

    return docs.filter(buildSmartViewQueryCheck(selectedSmartView.condition))
  }, [docsMap, selectedSmartView])

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={
          selectedSmartView == null || team == null
            ? []
            : [
                {
                  type: 'button',
                  variant: 'icon',
                  iconPath: mdiDotsHorizontal,
                  onClick: (event) =>
                    openContextModal(
                      event,
                      <SmartViewFolderContextMenu
                        smartView={selectedSmartView}
                        team={team}
                      />,
                      {
                        alignment: 'bottom-right',
                        removePadding: true,
                        hideBackground: true,
                      }
                    ),
                },
              ]
        }
      />
      <ApplicationContent>
        <Container>
          <Flexbox>
            <Button
              variant='transparent'
              className='smartView__control'
              iconPath={
                selectedSmartView != null && selectedSmartView.private
                  ? mdiLock
                  : undefined
              }
              onClick={(event) => {
                openContextModal(
                  event,
                  <SmartViewSelector
                    selectSmartView={(id) => {
                      setSelectedSmartViewId(id)
                      closeAllModals()
                    }}
                    selectedSmartViewId={selectedSmartViewId}
                    createNewSmartView={() =>
                      openModal(
                        <CreateSmartViewModal
                          onCreate={(smartView) => {
                            setSelectedSmartViewId(smartView.id)
                          }}
                        />
                      )
                    }
                  />,
                  {
                    alignment: 'right',
                    width: 250,
                  }
                )
              }}
            >
              <span>
                {selectedSmartView != null
                  ? selectedSmartView.name
                  : 'Select a smart view'}
              </span>
              <Icon path={mdiChevronDown} />
            </Button>
          </Flexbox>
          {selectedSmartView != null && team != null ? (
            <>
              <Flexbox className='smartView__filters'>
                <Button
                  variant='transparent-blue'
                  iconPath={mdiPlus}
                  size='sm'
                  onClick={() =>
                    openModal(
                      <UpdateSmartViewModal
                        smartView={selectedSmartView}
                        showOnlyConditions={true}
                      />
                    )
                  }
                >
                  Add filter
                </Button>
              </Flexbox>
              <Views
                team={team}
                views={selectedSmartViewViews}
                parent={{ type: 'smartView', target: selectedSmartView }}
                docs={selectedSmartViewDocs}
                currentUserIsCoreMember={currentUserIsCoreMember}
                workspacesMap={workspacesMap}
              />
            </>
          ) : null}
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const SmartViewSelector = ({
  selectSmartView,
  createNewSmartView,
}: {
  selectedSmartViewId?: string
  createNewSmartView: () => void
  selectSmartView: (id: string) => void
}) => {
  const { smartViewsMap } = useNav()

  const smartViews = useMemo(() => {
    return getMapValues(smartViewsMap)
  }, [smartViewsMap])

  return (
    <SmartViewSelectorContainer>
      <UpDownList>
        {smartViews.map((smartView) => (
          <NavigationItem
            id={`smartView__selector--${smartView.id}`}
            borderRadius={true}
            key={smartView.id}
            label={smartView.name}
            labelClick={() => selectSmartView(smartView.id)}
            icon={
              smartView.private ? { type: 'icon', path: mdiLock } : undefined
            }
          />
        ))}

        {smartViews.length > 0 && <BorderSeparator variant='second' />}
        <Button
          variant='transparent'
          iconPath={mdiPlus}
          onClick={createNewSmartView}
          id='new-smartView'
        >
          Add new Dashboard
        </Button>
      </UpDownList>
    </SmartViewSelectorContainer>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;

  .smartView__control {
    margin: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;

    span {
      padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  .views__list {
    flex: 1 1 auto;
    height: 100%;
  }

  .smartView__filters {
    padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

const SmartViewSelectorContainer = styled.div``

SmartViewPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getSmartViewListPageData(params)
  return result
}

export default SmartViewPage
