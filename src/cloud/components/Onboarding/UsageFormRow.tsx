import React from 'react'
import Radio from '../../../design/components/molecules/Form/atoms/FormRadio'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import styled from '../../../design/lib/styled'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import cc from 'classcat'
import Icon from '../../../design/components/atoms/Icon'
import {
  mdiAccountOutline,
  mdiAccountMultiplePlusOutline
} from '@mdi/js'

export type SpaceUsageIntent = 'personal' | 'team'

interface UsageFormRowProps {
  inSpaceForm: boolean
  intent?: SpaceUsageIntent
  setIntent: (intent: SpaceUsageIntent) => void
}

const UsageFormRow = ({
  inSpaceForm,
  intent,
  setIntent,
}: UsageFormRowProps) => {
  const { translate } = useI18n()
  return (
    <FormRow
      row={{
        title: !inSpaceForm
          ? 'How do you intend to use Boost Note?'
          : translate(lngKeys.SpaceIntent),
      }}
      fullWidth={true}
    >
      <Container>
        <button
          className={cc([
            'usage__option',
            intent === 'personal' && 'usage__option--selected',
          ])}
          onClick={() => setIntent('personal')}
          type='button'
        >
          <Radio checked={intent === 'personal'} />
          <Icon path={mdiAccountOutline} className='usage__option__icon' />
          <span className='usage__option__label'>
            {translate(lngKeys.SpaceIntentPersonal)}
          </span>
        </button>
        <button
          className={cc([
            'usage__option',
            intent === 'team' && 'usage__option--selected',
          ])}
          onClick={() => setIntent('team')}
          type='button'
        >
          <Radio checked={intent === 'team'} />
          <Icon path={mdiAccountMultiplePlusOutline} className='usage__option__icon' />
          <span className='usage__option__label'>
            {translate(lngKeys.SpaceIntentTeam)}
          </span>
        </button>
      </Container>
    </FormRow>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;

  .usage__option {
    background: none;
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.subtle};
    border: 1px solid transparent;
    transition: 0.3s;

    &:hover,
    &.usage__option--selected {
      color: ${({ theme }) => theme.colors.text.primary};
      .form__radio {
        border-color: ${({ theme }) => theme.colors.text.primary};
      }
    }

    .form__radio {
      cursor: pointer;
    }
  }

  .usage__option__label,
  .usage__option__icon {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .usage__option + .usage__option {
  }
`

export default UsageFormRow
