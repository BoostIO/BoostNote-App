import { capitalize } from 'lodash'
import React, { useRef, useState, useCallback, FormEvent } from 'react'
import { useEffectOnce } from 'react-use'
import Form from '../../../../design/components/molecules/Form'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import { BlockCreateRequestBody } from '../../../api/blocks'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'

interface EmbedFormProps {
  onSubmit: (block: BlockCreateRequestBody) => Promise<any>
}
const EmbedForm = ({ onSubmit }: EmbedFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const { translate } = useI18n()

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      try {
        const nameRegex = new RegExp(
          /^(?:https?:\/\/)?(?:www\.)?([^\/]*)/,
          'gi'
        )
        const regexResult = nameRegex.exec(url)
        const name = regexResult != null ? capitalize(regexResult[1]) : 'Embed'
        await onSubmit({
          name,
          type: 'embed',
          children: [],
          data: { url },
        })
      } finally {
      }
    },
    [onSubmit, url]
  )

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  return (
    <Form fullWidth={true} onSubmit={submit}>
      <FormRow fullWidth={true} row={{ title: 'Embed URL' }}>
        <FormRowItem
          item={{
            type: 'input',
            props: {
              ref: inputRef,
              value: url,
              onChange: (ev) => setUrl(ev.target.value),
            },
          }}
        />
        <FormRowItem
          flex='0 0 100px !important'
          item={{
            type: 'button',
            props: {
              type: 'submit',
              label: translate(lngKeys.GeneralCreate),
            },
          }}
        />
      </FormRow>
    </Form>
  )
}

export default EmbedForm
