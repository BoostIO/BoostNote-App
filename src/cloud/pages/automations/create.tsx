import React, { useMemo, useState } from 'react'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import Topbar from '../../../design/components/organisms/Topbar'
import { getTeamIndexPageData } from '../../api/pages/teams'
import { GeneralAppProps } from '../../interfaces/api'
import {
  SerializedAutomation,
  SerializedWorkflow,
} from '../../interfaces/db/automations'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { getWorkflows } from '../../api/automation/workflow'
import Form from '../../../design/components/molecules/Form'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import FormSelect from '../../../design/components/molecules/Form/atoms/FormSelect'
import { flattenObj } from '../../lib/utils/object'

type AutomationCreatePageProps = GeneralAppProps & {
  workflows: SerializedWorkflow[]
}

// pipe info
// env input if necessary
const AutomationCreatePage = ({ workflows }: AutomationCreatePageProps) => {
  const [automation, setAutomation] = useState({
    name: 'New Automation',
    description: '',
    workflowId: null as null | number,
  })

  const workflowOptions = useMemo(() => {
    return workflows.map((workflow) => ({
      label: workflow.name,
      value: workflow.id.toString(),
    }))
  }, [workflows])

  const currentWorkflow = useMemo(() => {
    return workflows.find((workflow) => workflow.id === automation.workflowId)
  }, [workflows, automation.workflowId])

  const currentSelected = useMemo(() => {
    return currentWorkflow != null
      ? { label: currentWorkflow.name, value: currentWorkflow.id.toString() }
      : undefined
  }, [currentWorkflow])

  const necessaryVars = useMemo(() => {
    if (currentWorkflow == null) {
      return []
    }

    return currentWorkflow.pipes.flatMap((pipe) => {
      return Object.values(flattenObj(pipe.configuration))
        .filter((val) => typeof val === 'string' && val.startsWith('$env.'))
        .map((val) => val.substr('$env.'.length))
    })
  }, [currentWorkflow])

  return (
    <ApplicationPage>
      <Topbar>
        <h2>Automations</h2>
      </Topbar>
      <ApplicationContent>
        <Form>
          <FormRow>
            <FormRowItem>
              <FormInput
                value={automation.name}
                onChange={(ev) =>
                  setAutomation({ ...automation, name: ev.target.value })
                }
              />
            </FormRowItem>
          </FormRow>
          <FormRow>
            <FormRowItem>
              <FormInput
                value={automation.description}
                onChange={(ev) =>
                  setAutomation({ ...automation, description: ev.target.value })
                }
              />
            </FormRowItem>
          </FormRow>
          <FormRow>
            <FormRowItem>
              <FormSelect
                placeholder='Select Workflow..'
                options={workflowOptions}
                value={currentSelected}
                onChange={({ value }) =>
                  setAutomation({ ...automation, workflowId: Number(value) })
                }
              />
            </FormRowItem>
          </FormRow>
        </Form>
      </ApplicationContent>
    </ApplicationPage>
  )
}

AutomationCreatePage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const [, team] = params.pathname.split('/')
  const [teamData, workflows] = await Promise.all([
    getTeamIndexPageData(params),
    getWorkflows({ team }),
  ])
  return {
    ...teamData,
    workflows,
  }
}

export default AutomationCreatePage
