import React, { useState } from 'react'
import Form from '../../../shared/components/molecules/Form'
import { ButtonProps } from '../../../shared/components/atoms/Button'
import { FormRowProps } from '../../../shared/components/molecules/Form/templates/FormRow'

interface EmojiInputFormProps {
  inputRef?: React.Ref<HTMLInputElement>
  prevRows?: FormRowProps[]
  defaultInputValue?: string
  placeholder?: string
  defaultEmoji?: string
  defaultIcon: string
  inputIsDisabled?: boolean
  submitButtonProps: ButtonProps & {
    label: React.ReactNode
    spinning?: boolean
  }
  onSubmit: (input: string, emoji?: string) => void
}

const BasicInputFormLocal = ({
  defaultInputValue = '',
  prevRows = [],
  placeholder,
  submitButtonProps,
  inputIsDisabled,
  onSubmit,
  inputRef,
  defaultIcon,
}: EmojiInputFormProps) => {
  const [value, setValue] = useState(defaultInputValue)

  return (
    <Form
      rows={[
        ...prevRows,
        {
          items: [
            {
              type: 'button',
              props: {
                label: '',
                variant: 'icon',
                iconPath: defaultIcon,
              },
            },
            {
              type: 'input',
              props: {
                ref: inputRef,
                disabled: inputIsDisabled,
                placeholder,
                value: value,
                onChange: (event) => setValue(event.target.value),
              },
            },
          ],
        },
      ]}
      submitButton={submitButtonProps}
      onSubmit={() => onSubmit(value)}
    />
  )
}

export default BasicInputFormLocal
