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
          /^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/,
          'gi'
        )
        const regexResult = nameRegex.exec(url)

        let name = 'Embed'
        if (regexResult != null) {
          let splits = regexResult[1].split('.')

          if (splits.length > 0) {
            splits = splits.slice(0, -1)
          }

          name = capitalize(splits.join(''))
        }

        await onSubmit({
          name,
          type: 'embed',
          children: [],
          data: { url: getEmbedURL(url) },
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

function getEmbedURL(url: string) {
  const isFigmaDefaultURL = /^(?:https:\/\/)?(?:www\.)?figma\.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/([^\?\n\r\/]+)?((?:\?[^\/]*?node-id=([^&\n\r\/]+))?[^\/]*?)(\/duplicate)?)?$/.test(
    url
  )
  if (isFigmaDefaultURL) {
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
      url
    )}`
  }
  const isYoutubeVideoURL = new RegExp(
    /^(?:https:\/\/)?(?:m.)?(?:www\.)?(?:(?:youtube\.com\/watch\?v=)|(?:youtu.be)\/)([A-z0-9_-]*)/,
    'gim'
  ).exec(url)
  if (isYoutubeVideoURL != null) {
    return `https://www.youtube.com/embed/${isYoutubeVideoURL[1]}`
  }
  return url
}

export default EmbedForm
