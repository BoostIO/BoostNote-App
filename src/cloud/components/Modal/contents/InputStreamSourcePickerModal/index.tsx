import React, { useCallback, useMemo, useState } from 'react'
import { SerializedTeamIntegration } from '../../../../interfaces/db/connections'
import { SerializedInputStream } from '../../../../interfaces/db/inputStream'
import styled from '../../../../../design/lib/styled'
import { useModal } from '../../../../../design/lib/stores/modal'
import Form from '../../../../../design/components/molecules/Form'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import ButtonGroup from '../../../../../design/components/atoms/ButtonGroup'
import Button, {
  LoadingButton,
} from '../../../../../design/components/atoms/Button'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import FormSelect from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import { InputStreamsActions } from '../../../../../design/lib/stores/inputStreams'
import GithubSourcePickerForm from './GithubSourcePickerForm'
import { useToast } from '../../../../../design/lib/stores/toast'

interface InputStreamSourcePickerModalProps {
  service: string
  integrations: SerializedTeamIntegration[]
  streams: SerializedInputStream[]
  actions: InputStreamsActions
}

const InputStreamSourcePickerModal = ({
  service,
  integrations,
  streams,
  actions,
}: InputStreamSourcePickerModalProps) => {
  const { translate } = useI18n()
  const { closeLastModal } = useModal()
  const [sending, setSending] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<
    SerializedTeamIntegration
  >()
  const [selectedSource, setSelectedSource] = useState<string>()
  const { pushMessage } = useToast()

  const content = useMemo(() => {
    switch (service) {
      case 'github:team':
        return (
          <GithubSourcePickerForm
            integration={selectedIntegration}
            setSource={setSelectedSource}
          />
        )
      default:
        return <>This service is not currently supported</>
    }
  }, [service, selectedIntegration])

  const submit = useCallback(async () => {
    if (sending || selectedIntegration == null || selectedSource == null) {
      return
    }

    setSending(true)
    const stream = streams.find((stream) => stream.type === service)

    const res =
      stream == null
        ? await actions.addInputStream(
            selectedIntegration.teamId,
            selectedIntegration.id,
            service,
            `${selectedIntegration.name}-stream`,
            selectedSource
          )
        : await actions.addSource(stream, selectedSource)

    if (!res.err) {
      closeLastModal()
      return
    } else {
      const { status, description } = res.error as any
      pushMessage({
        title: status || 'Error',
        description: description || 'Something wrong happened',
      })
    }

    setSending(false)
    return
  }, [
    sending,
    closeLastModal,
    selectedIntegration,
    selectedSource,
    streams,
    actions,
    service,
    pushMessage,
  ])

  return (
    <Container>
      <Form onSubmit={submit}>
        <FormRow row={{ title: 'Integration' }} fullWidth={true}>
          <FormRowItem>
            <FormSelect
              placeholder='Select an integration..'
              value={
                selectedIntegration != null
                  ? {
                      label: selectedIntegration.name,
                      value: selectedIntegration.id,
                    }
                  : undefined
              }
              onChange={(val) => {
                setSelectedIntegration(
                  integrations.find((i) => i.id === val.value)
                )
              }}
              options={integrations.map((integration) => {
                return { label: integration.name, value: integration.id }
              })}
            />
          </FormRowItem>
        </FormRow>
        {content}
        <FormRow
          fullWidth={true}
          row={{
            items: [
              {
                type: 'node',
                element: (
                  <ButtonGroup layout='spread' justifyContent='flex-end'>
                    <Button variant='secondary' onClick={closeLastModal}>
                      {translate(lngKeys.GeneralCancel)}
                    </Button>
                    <LoadingButton
                      spinning={sending}
                      type='submit'
                      variant='primary'
                      disabled={sending || selectedSource == null}
                    >
                      {translate(lngKeys.GeneralAddVerb)}
                    </LoadingButton>
                  </ButtonGroup>
                ),
              },
            ],
          }}
        ></FormRow>
      </Form>
    </Container>
  )
}

const Container = styled.div``

export default InputStreamSourcePickerModal
