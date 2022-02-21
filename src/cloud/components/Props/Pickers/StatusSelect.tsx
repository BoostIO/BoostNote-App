import React, { useCallback, useEffect, useRef, useState } from 'react'
import cc from 'classcat'
import PropertyValueButton from './PropertyValueButton'
import { SerializedStatus } from '../../../interfaces/db/status'
import { useStatuses } from '../../../lib/stores/status'
import { usePage } from '../../../lib/stores/pageStore'
import { mdiArrowDownDropCircleOutline } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import LabelManager, {
  LabelLike,
} from '../../../../design/components/molecules/LabelManager'
import { Label } from '../../../../design/components/atoms/Label'

interface StatusSelectProps {
  sending?: boolean
  status?: SerializedStatus
  disabled?: boolean
  isReadOnly: boolean
  emptyLabel?: string
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onClick?: (event: React.MouseEvent) => void
  onStatusChange: (status: SerializedStatus | null) => void
}

const StatusSelect = ({
  status,
  sending,
  disabled,
  emptyLabel,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onStatusChange,
  onClick,
}: StatusSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <StatusSelector
          onSelect={(status) => {
            onStatusChangeRef.current(status)
            closeLastModal()
          }}
        />,
        {
          alignment: popupAlignment,
          width: 200,
          removePadding: true,
          keepAll: true,
        }
      )
    },
    [openContextModal, closeLastModal, popupAlignment]
  )

  return (
    <div className={cc(['item__status__select', 'prop__margin'])}>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={(e) => (onClick != null ? onClick(e) : openSelector(e))}
        iconPath={showIcon ? mdiArrowDownDropCircleOutline : undefined}
      >
        {status != null ? (
          <Label name={status.name} backgroundColor={status.backgroundColor} />
        ) : emptyLabel != null ? (
          emptyLabel
        ) : (
          <Label name='No Status' />
        )}
      </PropertyValueButton>
    </div>
  )
}

export default StatusSelect

export const StatusSelector = ({
  readOnly,
  onSelect,
  ignoredStatuses = [],
}: {
  readOnly?: boolean
  ignoredStatuses?: string[]
  onSelect: (status: SerializedStatus | null) => void
}) => {
  const { team } = usePage()
  const { state, addStatus, removeStatus, editStatus } = useStatuses(team!.id)
  const [sending, setSending] = useState<boolean>(false)

  const createStatus = useCallback(
    async ({ name, backgroundColor }: LabelLike) => {
      if (sending) {
        return
      }
      setSending(true)
      await addStatus({ name, backgroundColor, team: team!.id })
      setSending(false)
    },
    [team, addStatus, sending]
  )

  return (
    <LabelManager
      labels={state.statuses.map((status) => {
        return {
          ...status,
          hide: ignoredStatuses.includes(status.id.toString()),
        }
      })}
      onSelect={onSelect}
      onCreate={!readOnly ? createStatus : undefined}
      onUpdate={!readOnly ? editStatus : undefined}
      onDelete={!readOnly ? removeStatus : undefined}
      type='Status'
      allowEmpty={
        ignoredStatuses == null ? true : !ignoredStatuses.includes('none')
      }
    />
  )
}
