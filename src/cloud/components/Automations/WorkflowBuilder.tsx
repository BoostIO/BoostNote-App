import { mdiClose, mdiPlus } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import { remove } from 'ramda'
import Button from '../../../design/components/atoms/Button'
import { getTeamIndexPageData } from '../../api/pages/teams'
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
import styled from '../../../design/lib/styled'

export type NewWorkflow = Omit<
  SerializedWorkflow,
  'id' | 'createdAt' | 'updatedAt'
> & { id?: number }

interface WorkflowBuilderProps {
  initialWorkflow: SerializedWorkflow | NewWorkflow
  onSubmit: (workflow: SerializedWorkflow | NewWorkflow) => void
  working?: boolean
}

const WorkflowBuilder = ({
  initialWorkflow,
  onSubmit,
  working = false,
}: WorkflowBuilderProps) => {
  const [workflow, setWorkflow] = useState(initialWorkflow)

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
        pipes: workflow.pipes.concat([
          { ...defaultPipe, name: `New Pipeline ${workflow.pipes.length + 1}` },
        ]),
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
    <Container>
      <Form>
        <FormRow row={{ title: 'Name' }}>
          <FormRowItem>
            <FormInput
              value={workflow.name}
              onChange={(ev) =>
                setWorkflow({ ...workflow, name: ev.target.value })
              }
            />
          </FormRowItem>
        </FormRow>
        <FormRow row={{ title: 'Description' }}>
          <FormRowItem>
            <FormInput
              value={workflow.description}
              onChange={(ev) =>
                setWorkflow({ ...workflow, description: ev.target.value })
              }
            />
          </FormRowItem>
        </FormRow>
      </Form>
      <Flexbox inline={true} className='workflow__pipe' alignItems='flex-start'>
        {workflow.pipes.map((pipe, i) => {
          return (
            <Flexbox key={i} alignItems='flex-start'>
              <PipeBuilder pipe={pipe} onChange={(pipe) => setPipe(pipe, i)} />
              <Button
                variant='transparent'
                onClick={() => removePipe(i)}
                iconPath={mdiClose}
              ></Button>
            </Flexbox>
          )
        })}
        <Button onClick={addPipe} iconPath={mdiPlus}>
          Add Pipeline
        </Button>
      </Flexbox>
      <div>
        <Button onClick={() => onSubmit(workflow)} disabled={working}>
          Save
        </Button>
      </div>
    </Container>
  )
}

WorkflowBuilder.getInitialProps = getTeamIndexPageData

export default WorkflowBuilder

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px;
  & .workflow__pipe {
    padding: ${({ theme }) => theme.sizes.spaces.df}px;
    & > * {
      flex: 0 0 auto;
    }
  }
`

const defaultPipe: SerializedPipe = {
  name: 'New Pipeline',
  event: 'github.issues.opened',
  configuration: {
    type: 'operation',
    identifier: 'boost.docs.create',
    input: {
      type: 'constructor',
      info: {
        type: 'struct',
        refs: {},
      },
    },
  },
}
