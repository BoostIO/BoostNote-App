import { isEmpty } from 'lodash'
import React from 'react'
import ColoredBlock from '../../design/components/atoms/ColoredBlock'
import Loader from '../../design/components/atoms/loaders'
import { TopbarPlaceholder } from '../../design/components/organisms/Topbar'
import { usePage } from '../lib/stores/pageStore'
import ApplicationContent from './ApplicationContent'
import ApplicationPage from './ApplicationPage'

const ApplicationPageLoader = ({
  team,
  loader,
}: {
  team: any
  loader: 'folder-page'
}) => {
  const { pageData } = usePage()

  if (!isEmpty(pageData || {}) && team == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Team is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <TopbarPlaceholder>
        <Loader variant='topbar' />
      </TopbarPlaceholder>
      <ApplicationContent reduced={true}>
        <Loader variant={loader} />
      </ApplicationContent>
    </ApplicationPage>
  )
}

export default ApplicationPageLoader
