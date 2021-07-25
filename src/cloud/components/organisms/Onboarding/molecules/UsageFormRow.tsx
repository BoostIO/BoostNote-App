import React from 'react'
import Radio from '../../../../../shared/components/molecules/Form/atoms/FormRadio'
import FormRow from '../../../../../shared/components/molecules/Form/templates/FormRow'
import styled from '../../../../../shared/lib/styled'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import cc from 'classcat'

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
          <img
            className='usage__option__img'
            src='/app/static/images/sozai1.svg'
          />
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
          <img
            className='usage__option__img'
            src='/app/static/images/sozai2.svg'
          />
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

  .usage__option__img {
    width: 40px;
    height: auto;
  }

  .usage__option__label,
  .usage__option__img {
    padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .usage__option + .usage__option {
  }
`

export default UsageFormRow

/** 
 * 
            <img src='/app/static/images/sozai1.svg' />
            <strong>Cloud space for myself</strong>
            <img src='/app/static/images/sozai2.svg' />
            <strong>Cloud space with my team</strong>
 */
