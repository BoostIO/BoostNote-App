import React from 'react'
import { DocStatus } from '../../../../../interfaces/db/doc'
import FormSelect, {
  FormSelectOption,
} from '../../../../../../shared/components/molecules/Form/atoms/FormSelect'
import Icon from '../../../../../../shared/components/atoms/Icon'
import {
  mdiPlayCircleOutline,
  mdiPauseCircleOutline,
  mdiCheckCircleOutline,
  mdiArchiveOutline,
} from '@mdi/js'
import styled from '../../../../../../shared/lib/styled'

interface DocStatusSelectProps {
  value: DocStatus | null
  update: (docStatus: DocStatus) => void
}

const DocStatusSelect = ({ value, update }: DocStatusSelectProps) => {
  return (
    <FormSelect
      options={
        (['in_progress', 'paused', 'completed', 'archived'] as DocStatus[]).map(
          getOptionByStatus
        ) as FormSelectOption[]
      }
      value={getOptionByStatus(value)}
      onChange={(newOption) => {
        update(newOption.value)
      }}
      minWidth='150px'
    />
  )
}

export default DocStatusSelect

function getOptionByStatus(status: DocStatus | null) {
  switch (status) {
    case 'in_progress':
      return {
        label: (
          <LabelContainer>
            <Icon className='label__icon' path={mdiPlayCircleOutline} /> In
            Progress
          </LabelContainer>
        ),
        value: 'in_progress',
      }
    case 'paused':
      return {
        label: (
          <LabelContainer>
            <Icon className='label__icon' path={mdiPauseCircleOutline} /> Paused
          </LabelContainer>
        ),
        value: 'paused',
      }
    case 'completed':
      return {
        label: (
          <LabelContainer>
            <Icon className='label__icon' path={mdiCheckCircleOutline} />{' '}
            Completed
          </LabelContainer>
        ),
        value: 'completed',
      }
    case 'archived':
      return {
        label: (
          <LabelContainer>
            <Icon className='label__icon' path={mdiArchiveOutline} /> Archived
          </LabelContainer>
        ),
        value: 'archived',
      }
    default:
      return undefined
  }
}

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  .label__icon {
    margin-right: 4px;
  }
`
