import { isEmpty } from 'lodash'
import React from 'react'
import ColoredBlock from '../../design/components/atoms/ColoredBlock'
import LoaderTopbar from '../../design/components/atoms/loaders/LoaderTopbar'
import { TopbarPlaceholder } from '../../design/components/organisms/Topbar'
import { usePage } from '../lib/stores/pageStore'
import ApplicationContent from './ApplicationContent'
import ApplicationPage from './ApplicationPage'

const ApplicationPageLoader = ({
  team,
  loader,
}: {
  team: any
  loader: React.ReactNode
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
        <LoaderTopbar />
      </TopbarPlaceholder>
      <ApplicationContent reduced={true}>{loader}</ApplicationContent>
    </ApplicationPage>
  )
}

export default ApplicationPageLoader
