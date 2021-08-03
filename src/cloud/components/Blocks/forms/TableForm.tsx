import React, { useRef, useState, useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import Form from '../../../../design/components/molecules/Form'
import { TableBlock } from '../../../api/blocks'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { FormProps } from '../BlockContent'

const TableForm = ({ onSubmit }: FormProps<TableBlock>) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [inputDisabled, setInputDisabled] = useState(false)
  const { translate } = useI18n()

  const submit = useCallback(async () => {
    try {
      setInputDisabled(true)
      await onSubmit({
        name: value,
        type: 'table',
        children: [],
        data: { columns: {} },
      })
    } finally {
      setInputDisabled(false)
    }
  }, [onSubmit, value])

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

export default TableForm
