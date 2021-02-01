import React, { useCallback } from 'react'
import styled from '../../../lib/styled'
import { inputStyle } from '../../../lib/styled/styleFunctions'
import ExpandingRow from './ExpandingRow'
import { UserFeedbackFormData } from './types'

type CheckboxProperty = 'needFeatures' | 'needIntegrations' | 'needCheaper'
type TextAreaProperty = 'features' | 'integrations' | 'price'

interface FeedbackFormProps {
  feedback: UserFeedbackFormData
  onChangeFeedback: (updated: Partial<UserFeedbackFormData>) => void
}

const FeedbackForm = ({ feedback, onChangeFeedback }: FeedbackFormProps) => {
  const checkboxChangeHandler = useCallback(
    (property: CheckboxProperty) => {
      onChangeFeedback({
        [property]: !feedback[property],
      })
    },
    [onChangeFeedback, feedback]
  )

  const textAreaChangeHandler = useCallback(
    (property: TextAreaProperty, val: string) => {
      onChangeFeedback({
        [property]: val,
      })
    },
    [onChangeFeedback]
  )

  return (
    <StyledFeedbackForm>
      <ExpandingRow
        label='I need more features'
        isChecked={feedback.needFeatures}
        toggleCheckBoxValue={() => checkboxChangeHandler('needFeatures')}
        expandedLabel='What kind of features do you want?'
        expandedValue={feedback.features}
        onChangeExpandedValue={(val) => textAreaChangeHandler('features', val)}
      />
      <ExpandingRow
        label='I need more integrations'
        isChecked={feedback.needIntegrations}
        toggleCheckBoxValue={() => checkboxChangeHandler('needIntegrations')}
        expandedLabel='What kind of integrations do you want?'
        expandedValue={feedback.integrations}
        onChangeExpandedValue={(val) =>
          textAreaChangeHandler('integrations', val)
        }
      />
      <ExpandingRow
        label='Pricing is too steep'
        isChecked={feedback.needCheaper}
        toggleCheckBoxValue={() => checkboxChangeHandler('needCheaper')}
        expandedLabel='What would be the proper price for you?'
        expandedValue={feedback.price}
        onChangeExpandedValue={(val) => textAreaChangeHandler('price', val)}
      />
    </StyledFeedbackForm>
  )
}

const StyledFeedbackForm = styled.form`
  max-width: 100%;
  margin:  ${({ theme }) => theme.space.medium}px auto;
  text-align: left;

  .flex {
    align-items: center;
    margin-bottom: ${({ theme }) => theme.space.small}px;

    input[type=checkbox],
    label {
      &:hover {
        cursor: pointer;
      }
    }

    input[type=checkbox] {
      width: 22px;
      height: 22px;
    }

    label {
      padding-left: ${({ theme }) => theme.space.xsmall}px;
      margin-bottom: 0;
    }
  }

  .row {
    display: block;
    position: relative;

    input {
      position: relative;
      width: 100%;
      height: 50px;
      ${inputStyle}
      padding-left: ${({ theme }) => theme.space.small}px;
    }
  }
`

export default FeedbackForm
