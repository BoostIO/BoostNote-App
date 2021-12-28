import React, { useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { ButtonProps } from '../atoms/Button'
import Form from '../molecules/Form'
import { FormRowProps } from '../molecules/Form/templates/FormRow'

interface InputFormProps {
  prevRows?: FormRowProps[]
  defaultInputValue?: string
  placeholder: string
  inputIsDisabled?: boolean
  submitButtonProps?: ButtonProps & {
    label: React.ReactNode
    spinning?: boolean
  }
  onSubmit: (input: string) => void
  onBlur?: (input: string) => void
}

const InputForm = ({
  defaultInputValue = '',
  prevRows = [],
  placeholder,
  submitButtonProps,
  inputIsDisabled,
  onSubmit,
  onBlur,
}: InputFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultInputValue)

  useEffectOnce(() => {
    if (inputRef.current != null && !inputIsDisabled) {
      inputRef.current.focus()
    }
  })

  return (
    <Form
      rows={[
        ...prevRows,
        {
          items: [
            {
              type: 'input',
              props: {
                ref: inputRef,
                disabled: inputIsDisabled,
                placeholder,
                value: value,
                onChange: (event) => setValue(event.target.value),
                onBlur: () => {
                  if (onBlur != null) {
                    onBlur(value)
                  }
                },
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

export default InputForm
