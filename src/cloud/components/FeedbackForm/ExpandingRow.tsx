import React, { useCallback } from 'react'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Checkbox from '../../../design/components/molecules/Form/atoms/FormCheckbox'

interface ExpandingRowProps {
  label: string
  isChecked: boolean
  expandedLabel: string
  expandedValue?: string
  toggleCheckBoxValue: () => void
  onChangeExpandedValue: (val: string) => void
}

const ExpandingRow = ({
  label,
  isChecked,
  toggleCheckBoxValue,
  expandedValue = '',
  expandedLabel,
  onChangeExpandedValue,
}: ExpandingRowProps) => {
  const onCheckboxChangeHandler = useCallback(() => {
    toggleCheckBoxValue()
  }, [toggleCheckBoxValue])

  const onTextAreaChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeExpandedValue(event.target.value)
    },
    [onChangeExpandedValue]
  )

  return (
    <>
      <FormRow fullWidth={true}>
        <FormRowItem
          item={{
            type: 'node',
            element: (
              <Flexbox alignItems='center'>
                <Checkbox
                  checked={isChecked}
                  toggle={onCheckboxChangeHandler}
                />
                <label
                  style={{ marginLeft: 5 }}
                  onClick={onCheckboxChangeHandler}
                >
                  {label}
                </label>
              </Flexbox>
            ),
          }}
        />
      </FormRow>
      {isChecked && (
        <FormRow
          className='expanded-field'
          row={{
            title: expandedLabel,
            items: [
              {
                type: 'textarea',
                props: {
                  placeholder: 'Please give us your feedback...',
                  value: expandedValue,
                  onChange: onTextAreaChangeHandler,
                },
              },
            ],
          }}
          fullWidth={true}
        />
      )}
    </>
  )
}

export default ExpandingRow
