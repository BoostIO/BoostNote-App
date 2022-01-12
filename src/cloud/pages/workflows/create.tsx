import React, { useState } from 'react'
import { getTeamIndexPageData } from '../../api/pages/teams'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import PipeBuilder from '../../components/Automations/PipeBuilder'
import { SerializedPipe } from '../../interfaces/db/automations'

const WorkflowCreatePage = () => {
  const [pipe, setPipe] = useState<SerializedPipe>(() => ({
    name: '',
    event: 'github.issues.opened',
    action: 'boost.document.create',
    configuration: {},
    filter: {},
  }))

  return (
    <ApplicationPage>
      <ApplicationContent>
        <PipeBuilder pipe={pipe} onChange={setPipe} />
      </ApplicationContent>
    </ApplicationPage>
  )
}

WorkflowCreatePage.getInitialProps = getTeamIndexPageData

export default WorkflowCreatePage
