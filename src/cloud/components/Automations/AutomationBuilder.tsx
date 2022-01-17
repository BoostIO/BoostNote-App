import React, { useCallback, useMemo, useState } from 'react'
import {
  SerializedAutomation,
  SerializedWorkflow,
} from '../../interfaces/db/automations'
import Form from '../../../design/components/molecules/Form'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import FormSelect from '../../../design/components/molecules/Form/atoms/FormSelect'
import { flattenObj } from '../../lib/utils/object'
import Button from '../../../design/components/atoms/Button'
import styled from '../../../design/lib/styled'

export type BaseAutomation = Omit<
  SerializedAutomation,
  'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'teamId' | 'workflowId'
> & { workflowId: number | null }

interface AutomationBuilderProps<T extends BaseAutomation> {
  initialAutomation: T
  workflows: SerializedWorkflow[]
  onSubmit: (automation: T) => void
  working?: boolean
  disabled?: Set<keyof BaseAutomation>
}

const AutomationBuilder = <T extends BaseAutomation>({
  initialAutomation,
  workflows,
  onSubmit,
  working,
  disabled,
}: AutomationBuilderProps<T>) => {
  const [automation, setAutomation] = useState<T>(initialAutomation)
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

  const setWorkflow = useCallback(
    (id: number) => {
      const currentWorkflow = workflows.find((workflow) => workflow.id === id)
      if (currentWorkflow != null) {
        setAutomation((automation) => {
          return {
            ...automation,
            workflowId: currentWorkflow.id,
            env: Object.fromEntries(
              currentWorkflow.pipes.flatMap((pipe) => {
                return Object.values(flattenObj(pipe.configuration))
                  .filter(
                    (val) => typeof val === 'string' && val.startsWith('$env.')
                  )
                  .map((val) => [val.substr('$env.'.length), null])
              })
            ),
          }
        })
      }
    },
    [workflows]
  )

  return (
    <Container>
      <Form>
        <FormRow row={{ title: 'Name' }}>
          <FormRowItem>
            <FormInput
              readOnly={disabled && disabled.has('name')}
              value={automation.name}
              onChange={(ev) =>
                setAutomation({ ...automation, name: ev.target.value })
              }
            />
          </FormRowItem>
        </FormRow>
        <FormRow row={{ title: 'Description' }}>
          <FormRowItem>
            <FormInput
              readOnly={disabled && disabled.has('description')}
              value={automation.description}
              onChange={(ev) =>
                setAutomation({
                  ...automation,
                  description: ev.target.value,
                })
              }
            />
          </FormRowItem>
        </FormRow>
        <FormRow row={{ title: 'Workflow' }}>
          <FormRowItem>
            <FormSelect
              isDisabled={disabled != null && disabled.has('workflowId')}
              placeholder='Select Workflow..'
              options={workflowOptions}
              value={currentSelected}
              onChange={({ value }) => setWorkflow(Number(value))}
            />
          </FormRowItem>
        </FormRow>
        <FormRow row={{ title: 'Env' }} />
        {Object.keys(automation.env).length === 0 && (
          <div>No Required Env for this this Workflow</div>
        )}
        {Object.entries(automation.env).map(([key, value]) => {
          return (
            <FormRow key={key}>
              <FormRowItem>
                <FormInput value={key} readOnly={true} />
              </FormRowItem>
              <FormRowItem>
                <FormInput
                  readOnly={disabled && disabled.has('env')}
                  value={(value || '') as string}
                  onChange={(ev) =>
                    setAutomation({
                      ...automation,
                      env: { ...automation.env, [key]: ev.target.value },
                    })
                  }
                />
              </FormRowItem>
            </FormRow>
          )
        })}
      </Form>
      <Button disabled={working} onClick={() => onSubmit(automation)}>
        Save
      </Button>
    </Container>
  )
}

export default AutomationBuilder

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.df}px;
`
