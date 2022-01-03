import { mdiClose } from '@mdi/js'
import React from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { BulkApiActionRes } from '../../../design/lib/hooks/useBulkApi'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { UpdateSmartViewRequestBody } from '../../api/teams/smartViews'
import {
  SerializedQuery,
  SerializedSmartView,
} from '../../interfaces/db/smartView'
import { SupportedViewTypes } from '../../interfaces/db/view'
import { EditableQuery } from '../Modal/contents/SmartView/interfaces'
import SmartViewForm from '../Modal/contents/SmartView/SmartViewForm'

interface UpdateSmartViewModalProps {
  teamId: string
  smartView: SerializedSmartView
  save: (body: UpdateSmartViewRequestBody) => Promise<BulkApiActionRes>
}

const UpdateSmartViewModal = ({
  teamId,
  smartView,
  save,
}: UpdateSmartViewModalProps) => {
  const [sending, setSending] = useState(false)
  const { closeLastModal } = useModal()

  const onSubmit = useCallback(
    async (body: {
      name: string
      condition: SerializedQuery
      type?: SupportedViewTypes
    }) => {
      setSending(true)
      const res = await save(body)
      setSending(false)

      if (!res.err) {
        closeLastModal()
      }
    },
    [save, closeLastModal]
  )

  return (
    <Container>
      <Flexbox justifyContent='space-between'>
        <h2>Edit Smart View</h2>
        <Button
          variant='icon'
          iconPath={mdiClose}
          onClick={closeLastModal}
          id='modal-close'
        />
      </Flexbox>
      <div className='smartview__types__wrapper'>
        <SmartViewForm
          teamId={teamId}
          defaultName={smartView.name}
          defaultViewType={smartView.view.type}
          action='Update'
          onSubmit={onSubmit}
          buttonsAreDisabled={sending}
          defaultConditions={
            Array.isArray(smartView.condition)
              ? (smartView.condition as EditableQuery)
              : []
          }
        />
      </div>
    </Container>
  )
}

const Container = styled.div``

export default UpdateSmartViewModal
