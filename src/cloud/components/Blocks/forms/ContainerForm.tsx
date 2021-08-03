import React, { useRef, useState, useCallback } from 'react'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { useEffectOnce } from 'react-use'
import Form from '../../../../../shared/components/molecules/Form'
import { lngKeys } from '../../../../lib/i18n/types'
import { FormProps } from '../BlockContent'
import { ContainerBlock } from '../../../../api/blocks'

const ContainerForm = ({ onSubmit }: FormProps<ContainerBlock>) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [inputDisabled, setInputDisabled] = useState(false)
  const { translate } = useI18n()

  const submit = useCallback(async () => {
    try {
      setInputDisabled(true)
      await onSubmit({
        name: 'container',
        type: 'container',
        children: [],
        data: null,
      })
    } finally {
      setInputDisabled(false)
    }
  }, [onSubmit])

  useEffectOnce(() => {
    if (inputRef.current != null && !inputDisabled) {
      inputRef.current.focus()
    }
  })

  return (
    <Form
      fullWidth={true}
      rows={[
        {
          title: 'Name',
          items: [
            {
              type: 'input',
              props: {
                disabled: inputDisabled,
                placeholder: '',
                value,
                onChange: (event) => setValue(event.target.value),
              },
            },
          ],
        },
      ]}
      submitButton={{ label: translate(lngKeys.GeneralCreate) }}
      onSubmit={submit}
    />
  )
}

export default ContainerForm
