import React, { useRef, useState, useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import Form from '../../../../design/components/molecules/Form'
import { Block } from '../../../api/blocks'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'

interface EmbedFormProps {
  onSubmit: (block: Omit<Block<'embed', { url: string }>, 'id'>) => Promise<any>
}
const EmbedForm = ({ onSubmit }: EmbedFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [inputDisabled, setInputDisabled] = useState(false)
  const { translate } = useI18n()

  const submit = useCallback(async () => {
    try {
      setInputDisabled(true)
      await onSubmit({
        name,
        type: 'embed',
        children: [],
        data: { url },
      })
    } finally {
      setInputDisabled(false)
    }
  }, [onSubmit, name, url])

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
                name,
                onChange: (event) => setName(event.target.value),
              },
            },
          ],
        },
        {
          title: 'Embed URL',
          items: [
            {
              type: 'input',
              props: {
                disabled: inputDisabled,
                placeholder: '',
                name,
                onChange: (event) => setUrl(event.target.value),
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

export default EmbedForm
