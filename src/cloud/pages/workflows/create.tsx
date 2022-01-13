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
import Flexbox from '../../../design/components/atoms/Flexbox'
import Form from '../../../design/components/molecules/Form'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'

type NewWorkflow = Omit<SerializedWorkflow, 'id' | 'createdAt' | 'updatedAt'>

// better styling
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
        <Form>
          <FormRow row={{ title: 'Name' }}>
            <FormRowItem>
              <FormInput
                value={workflow.name}
                onChange={(ev) =>
                  setWorkflow({ ...workflow, name: ev.target.name })
                }
              />
            </FormRowItem>
          </FormRow>
          <FormRow row={{ title: 'Description' }}>
            <FormRowItem>
              <FormInput
                value={workflow.description}
                onChange={(ev) =>
                  setWorkflow({ ...workflow, description: ev.target.name })
                }
              />
            </FormRowItem>
          </FormRow>
        </Form>
        <Flexbox wrap='nowrap' alignItems='flex-start'>
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
        </Flexbox>
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
  filter: {},
}
