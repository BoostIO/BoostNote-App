import React, { useCallback } from 'react'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedPropData, PropData, Props } from '../../interfaces/db/props'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import AssigneeSelect from './Pickers/AssigneeSelect'
import DueDateSelect from './Pickers/DueDateSelect'
import { format as formatDate } from 'date-fns'
import StatusSelect from './Pickers/StatusSelect'
import TimePeriodPicker from './Pickers/TimePeriodPicker'
import { mdiAlertOutline } from '@mdi/js'
import PropertyValueButton from './Pickers/PropertyValueButton'
import WithTooltip from '../../../design/components/atoms/WithTooltip'

interface PropPickerProps {
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
  propName: string
  propData: SerializedPropData
  readOnly?: boolean
  isErrored?: boolean
  onUpdate?: (newProps: Props) => void
  portalId?: string
}

const PropPicker = ({
  parent,
  propName,
  propData,
  onUpdate,
  readOnly = false,
  isErrored,
  portalId,
}: PropPickerProps) => {
  const { sendingMap, updateDocPropsApi } = useCloudApi()

  const updateProp = useCallback(
    async (newData: PropData | null) => {
      const res = await updateDocPropsApi(parent.target, [propName, newData])

      if (!res.err && onUpdate != null) {
        const props = res.data as {
          data: Props
        }
        onUpdate(props.data)
      }
    },
    [parent.target, propName, onUpdate, updateDocPropsApi]
  )

  if (isErrored) {
    return (
      <WithTooltip
        tooltip={`This property's data is of a different type than its column's. Please modify it from the document page.`}
      >
        <PropertyValueButton
          className='property--errored'
          disabled={true}
          isErrored={isErrored}
          isReadOnly={readOnly}
          iconPath={mdiAlertOutline}
        />
      </WithTooltip>
    )
  }

  switch (propData.type) {
    case 'user':
      return (
        <AssigneeSelect
          disabled={sendingMap.get(parent.target.id) != null || readOnly}
          isLoading={sendingMap.get(parent.target.id) === propName}
          isErrored={isErrored}
          readOnly={readOnly}
          defaultValue={
            propData.data != null
              ? Array.isArray(propData.data)
                ? propData.data
                    .filter((item) => item != null)
                    .map((item) => item!.userId)
                : [propData.data.userId]
              : []
          }
          update={(val) =>
            updateProp(
              val.length === 0
                ? { type: 'user', data: null }
                : { type: 'user', data: val as any }
            )
          }
        />
      )
    case 'date':
      return (
        <DueDateSelect
          disabled={sendingMap.get(parent.target.id) != null || readOnly}
          sending={sendingMap.get(parent.target.id) === propName}
          isErrored={isErrored}
          isReadOnly={readOnly}
          portalId={portalId}
          dueDate={propData.data == null ? null : propData.data.toString()}
          onDueDateChange={(newDate: Date | null) =>
            updateProp(
              newDate != null
                ? {
                    type: 'date',
                    data: new Date(
                      formatDate(newDate, 'yyyy-MM-dd') + 'T00:00:00.000Z'
                    ),
                  }
                : {
                    type: 'date',
                    data: null,
                  }
            )
          }
        />
      )
    case 'status':
      return (
        <StatusSelect
          status={
            Array.isArray(propData.data) ? propData.data[0] : propData.data
          }
          isErrored={isErrored}
          sending={sendingMap.get(parent.target.id) === 'status'}
          disabled={sendingMap.get(parent.target.id) != null || readOnly}
          isReadOnly={readOnly}
          onStatusChange={(val) =>
            updateProp({
              type: 'status',
              data: val == null ? val : val.id,
            })
          }
        />
      )
    case 'json':
      if (
        propData.data != null &&
        propData.data.dataType === 'timeperiod' &&
        (propData.data.data == null || typeof propData.data.data === 'number')
      ) {
        return (
          <TimePeriodPicker
            modalLabel={propName}
            isReadOnly={readOnly}
            isErrored={isErrored}
            sending={sendingMap.get(parent.target.id) === propName}
            disabled={sendingMap.get(parent.target.id) != null || readOnly}
            value={propData.data.data}
            onPeriodChange={(val) => {
              updateProp({
                type: 'json',
                data: { dataType: 'timeperiod', data: val },
              })
            }}
          />
        )
      }
      return null
    default:
      return null
  }
}

export default PropPicker
