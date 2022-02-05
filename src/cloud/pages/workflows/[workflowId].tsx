import React, { useCallback, useState } from 'react'
import { getWorkflow, updateWorkflow } from '../../api/automation/workflow'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { getTeamIndexPageData } from '../../api/pages/teams'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import { SerializedWorkflow } from '../../interfaces/db/automations'
import Topbar from '../../../design/components/organisms/Topbar'
import { useToast } from '../../../design/lib/stores/toast'
import { GeneralAppProps } from '../../interfaces/api'
import WorkflowBuilder, {
  NewWorkflow,
} from '../../components/Automations/WorkflowBuilder'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

type WorkflowPageProps = GeneralAppProps & { workflow: SerializedWorkflow }

const WorkflowPage = ({ team, workflow: initial }: WorkflowPageProps) => {
  const { pushApiErrorMessage, pushMessage } = useToast()
  const [working, setWorking] = useState(false)

  const saveWorkflow = useCallback(
    async (workflow: NewWorkflow | SerializedWorkflow) => {
      try {
        setWorking(true)
        await updateWorkflow(initial.id, {
          name: workflow.name,
          description: workflow.description,
          pipes: workflow.pipes,
          team: team.id,
        })
        pushMessage({
          title: 'Workflow Updated!',
          description: `"${workflow.name}" has been successfully updated`,
          type: 'success',
        })
        trackEvent(MixpanelActionTrackTypes.WorkflowUpdate)
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setWorking(false)
      }
    },
    [pushApiErrorMessage, pushMessage, team, initial.id]
  )

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Workflows</h2>
      </Topbar>
      <ApplicationContent>
        <WorkflowBuilder
          initialWorkflow={initial}
          onSubmit={saveWorkflow}
          working={working}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

WorkflowPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const workflowId = params.pathname.split('/')[3]
  const [teamData, workflow] = await Promise.all([
    getTeamIndexPageData(params),
    getWorkflow(workflowId),
  ])
  return {
    ...teamData,
    workflow,
  }
}

export default WorkflowPage
