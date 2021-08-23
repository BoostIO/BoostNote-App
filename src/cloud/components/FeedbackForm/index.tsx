import React, { useCallback } from 'react'
import Form from '../../../design/components/molecules/Form'
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
    <Form>
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
      <br />
    </Form>
  )
}

export default FeedbackForm
