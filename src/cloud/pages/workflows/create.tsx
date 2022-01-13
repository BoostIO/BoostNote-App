import { mdiClose, mdiPlus } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import { remove } from 'ramda'
import Button from '../../../design/components/atoms/Button'
import { getTeamIndexPageData } from '../../api/pages/teams'
import ApplicationContent from '../../components/ApplicationContent'
import ApplicationPage from '../../components/ApplicationPage'
import PipeBuilder from '../../components/Automations/PipeBuilder'
import {
  SerializedPipe,
  SerializedWorkflow,
} from '../../interfaces/db/automations'

type NewWorkflow = Omit<SerializedWorkflow, 'id' | 'createdAt' | 'updatedAt'>

// pipeline remove
// better styling
// workflow name + description
// saving
// abstract
// Workflow update page
const WorkflowCreatePage = () => {
  const [workflow, setWorkflow] = useState<NewWorkflow>({
    name: 'New Workflow',
    description: '',
    pipes: [defaultPipe],
  })

  const setPipe = useCallback((pipe: SerializedPipe, index: number) => {
    return setWorkflow((workflow) => {
      return {
        ...workflow,
        pipes: workflow.pipes.map((item, i) => (i === index ? pipe : item)),
      }
    })
  }, [])

  const addPipe = useCallback(() => {
    setWorkflow((workflow) => {
      return {
        ...workflow,
        pipes: workflow.pipes.concat([defaultPipe]),
      }
    })
  }, [])

  const removePipe = useCallback((index: number) => {
    setWorkflow((workflow) => {
      return {
        ...workflow,
        pipes: remove(index, 1, workflow.pipes),
      }
    })
  }, [])

  return (
    <ApplicationPage>
      <ApplicationContent>
        <div>
          {workflow.pipes.map((pipe, i) => {
            return (
              <div key={i}>
                <PipeBuilder
                  pipe={pipe}
                  onChange={(pipe) => setPipe(pipe, i)}
                />
                <Button
                  onClick={() => removePipe(i)}
                  iconPath={mdiClose}
                ></Button>
              </div>
            )
          })}
          <Button onClick={addPipe} iconPath={mdiPlus}>
            Add Pipeline
          </Button>
        </div>
      </ApplicationContent>
    </ApplicationPage>
  )
}

WorkflowCreatePage.getInitialProps = getTeamIndexPageData

export default WorkflowCreatePage

const defaultPipe = {
  name: 'New Pipeline',
  event: 'github.issues.opened',
  action: 'boost.doc.update',
  configuration: {},
  filter: {},
}
