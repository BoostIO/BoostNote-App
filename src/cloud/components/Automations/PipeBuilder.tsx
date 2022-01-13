import React, { useMemo, useState } from 'react'
import Form from '../../../design/components/molecules/Form'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import FormSelect from '../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
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

  const [action, setAction] = useState(SUPPORTED_ACTION_OPTIONS[0])

  return (
    <Form>
      <FormRow>
        <FormRowItem>
          <FormInput
            value={pipe.name}
            onChange={(ev) => onChange({ ...pipe, name: ev.target.value })}
          />
        </FormRowItem>
      </FormRow>

      <div>
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
      <div>
        {pipe.filter != null && (
          <FilterBuilder
            filter={pipe.filter}
            typeDef={currentEvent}
            onChange={(filter) => onChange({ ...pipe, filter })}
          />
        )}
      </div>
      <div>
        <FormRow>
          <FormRowItem>
            <FormSelect
              options={SUPPORTED_ACTION_OPTIONS}
              value={action}
              onChange={setAction}
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
    </Form>
  )
}

export default PipeBuilder
