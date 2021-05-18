import React, { useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import { ButtonProps } from '../atoms/Button'
import Form from '../molecules/Form'
import { FormRowProps } from '../molecules/Form/layouts/FormRow'

interface EmojiInputFormProps {
  prevRows?: FormRowProps[]
  defaultInputValue?: string
  placeholder: string
  defaultEmoji?: string
  defaultIcon: string
  inputIsDisabled?: boolean
  submitButtonProps: ButtonProps & {
    label: React.ReactNode
    spinning?: boolean
  }
  onSubmit: (input: string, emoji?: string) => void
}

const EmojiInputForm = ({
  defaultInputValue = '',
  defaultEmoji,
  defaultIcon,
  prevRows = [],
  placeholder,
  submitButtonProps,
  inputIsDisabled,
  onSubmit,
}: EmojiInputFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultInputValue)
  const [emoji, setEmoji] = useState(defaultEmoji)

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
              type: 'emoji',
              props: {
                defaultIcon,
                emoji,
                setEmoji,
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
      onSubmit={() => onSubmit(value, emoji)}
    />
  )
}

export default EmojiInputForm
