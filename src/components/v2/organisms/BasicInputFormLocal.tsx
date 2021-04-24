import React, { useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Form, { FormRowProps } from '../../../shared/components/molecules/Form'
import { ButtonProps } from '../../../shared/components/atoms/Button'

interface EmojiInputFormProps {
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
}: EmojiInputFormProps) => {
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
