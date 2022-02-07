import React, { useCallback, useState } from 'react'
import { getTeamIndexPageData } from '../../api/pages/teams'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import { SerializedWorkflow } from '../../interfaces/db/automations'
import Topbar from '../../../design/components/organisms/Topbar'
import { useToast } from '../../../design/lib/stores/toast'
import { createWorkflow } from '../../api/automation/workflow'
import { GeneralAppProps } from '../../interfaces/api'
import WorkflowBuilder, {
  NewWorkflow,
} from '../../components/Automations/WorkflowBuilder'
import { useRouter } from '../../lib/router'
import { getTeamURL } from '../../lib/utils/patterns'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

const WorkflowCreatePage = ({ team }: GeneralAppProps) => {
  const { pushMessage, pushApiErrorMessage } = useToast()
  const { push } = useRouter()
  const [workflow] = useState<NewWorkflow | SerializedWorkflow>({
    name: 'New Workflow',
    description: '',
    teamId: team.id,
    pipes: [defaultPipe],
  })
  const [working, setWorking] = useState(false)

  const saveWorkflow = useCallback(
    async (workflow: NewWorkflow | SerializedWorkflow) => {
      try {
        setWorking(true)
        const created = await createWorkflow({
          name: workflow.name,
          description: workflow.description,
          pipes: workflow.pipes,
          team: team.id,
        })
        pushMessage({
          title: 'Workflow Created!',
          description: `"${workflow.name}" has been successfully created`,
          type: 'success',
        })
        push(`${getTeamURL(team)}/workflows/${created.id}`)
        trackEvent(MixpanelActionTrackTypes.WorkflowCreate)
      } catch (err) {
        pushApiErrorMessage(err)
      } finally {
        setWorking(false)
      }
    },
    [pushMessage, pushApiErrorMessage, team, push]
  )

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Workflows</h2>
      </Topbar>
      <ApplicationContent>
        <WorkflowBuilder
          initialWorkflow={workflow}
          onSubmit={saveWorkflow}
          working={working}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

WorkflowCreatePage.getInitialProps = getTeamIndexPageData

export default WorkflowCreatePage

const defaultPipe = {
  name: 'New Pipeline',
  event: 'github.issues.opened',
  action: 'boost.doc.create',
  configuration: {
    title: '$event.issue.title',
    content: '$event.issue.body',
    props: {
      IssueID: {
        type: 'number',
        data: '$event.issue.id',
      },
    },
  },
}
