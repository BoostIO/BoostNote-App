import { mdiPlus } from '@mdi/js'
import React, { useMemo } from 'react'
import Button from '../../../design/components/atoms/Button'
import Form from '../../../design/components/molecules/Form'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import FormSelect from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import styled from '../../../design/lib/styled'
import { SerializedPipe } from '../../interfaces/db/automations'
import supportedEvents from '../../lib/automations/events'
import CreateDocActionConfigurator from './actions/CreateDocActionConfigurator'
import UpdateDocActionConfigurator from './actions/UpdateDocActionConfigurator'
import EventInfo from './EventInfo'
import FilterBuilder from './FilterBuilder'

const SUPPORTED_EVENT_NAMES = Object.keys(supportedEvents).map((key) => {
  return { label: key, value: key }
})

const SUPPORTED_ACTION_OPTIONS = [
  { value: 'boost.doc.create', label: 'boost.doc.create' },
  { value: 'boost.doc.update', label: 'boost.doc.update' },
]

interface PipeBuilderProps {
  pipe: SerializedPipe
  onChange: (pipe: SerializedPipe) => void
}

const PipeBuilder = ({ pipe, onChange }: PipeBuilderProps) => {
  const currentEvent = useMemo(() => {
    return supportedEvents[pipe.event]
  }, [pipe.event])

  const action = useMemo(() => {
    return (
      SUPPORTED_ACTION_OPTIONS.find(({ value }) => value === pipe.action) ||
      SUPPORTED_ACTION_OPTIONS[0]
    )
  }, [pipe.action])

  return (
    <Container>
      <FormRow>
        <FormRowItem>
          <FormInput
            value={pipe.name}
            onChange={(ev) => onChange({ ...pipe, name: ev.target.value })}
          />
        </FormRowItem>
      </FormRow>

      <div className='section'>
        <h4>Event</h4>
        <FormRow>
          <FormRowItem>
            <FormSelect
              value={{ label: pipe.event, value: pipe.event }}
              options={SUPPORTED_EVENT_NAMES}
              onChange={({ value }) => onChange({ ...pipe, event: value })}
            />
          </FormRowItem>
        </FormRow>
        <FormRow>
          {currentEvent != null ? (
            <EventInfo name={pipe.event} typeDef={currentEvent} />
          ) : (
            <div>Select Event</div>
          )}
        </FormRow>
      </div>

      <div className='spacer'></div>
      {pipe.filter != null ? (
        <div className='section'>
          <h4>Filter</h4>
          <FilterBuilder
            filter={pipe.filter}
            typeDef={currentEvent}
            onChange={(filter) => onChange({ ...pipe, filter })}
          />
        </div>
      ) : (
        <Button
          onClick={() => onChange({ ...pipe, filter: {} })}
          iconPath={mdiPlus}
        ></Button>
      )}
      <div className='spacer'></div>

      <div className='section'>
        <h4>Action</h4>
        <FormRow>
          <FormRowItem>
            <FormSelect
              options={SUPPORTED_ACTION_OPTIONS}
              value={action}
              onChange={({ value }) => onChange({ ...pipe, action: value })}
            />
          </FormRowItem>
        </FormRow>
        <FormRow>
          {action.value === 'boost.doc.create' && (
            <CreateDocActionConfigurator
              configuration={pipe.configuration}
              onChange={(configuration) => onChange({ ...pipe, configuration })}
              eventType={currentEvent}
            />
          )}
          {action.value === 'boost.doc.update' && (
            <UpdateDocActionConfigurator
              configuration={pipe.configuration}
              onChange={(configuration) => onChange({ ...pipe, configuration })}
              eventType={currentEvent}
            />
          )}
        </FormRow>
      </div>
    </Container>
  )
}

export default PipeBuilder

const Container = styled(Form)`
  display: flex;
  flex-direction: column;

  & .section {
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    background-color: ${({ theme }) => theme.colors.background.primary};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px;

    & h4 {
      margin: ${({ theme }) => theme.sizes.spaces.sm}px 0;
    }
  }

  & .spacer {
    position: relative;
    height: ${({ theme }) => theme.sizes.spaces.xl}px;
    margin: 0;

    &:before {
      content: '';
      height: 100%;
      width: 50%;
      border-right: 2px solid ${({ theme }) => theme.colors.border.main};
      position: absolute;
    }
  }
`
