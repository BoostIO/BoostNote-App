import React, { useCallback } from 'react'
import {
  DocStatus,
  SerializedDocWithSupplemental,
} from '../../interfaces/db/doc'
import { NullablePropData, PropData, Props } from '../../interfaces/db/props'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import AssigneeSelect from './Pickers/AssigneeSelect'
import DueDateSelect from './Pickers/DueDateSelect'
import { format as formatDate } from 'date-fns'
import { toLower } from 'lodash'
import StatusSelect from './Pickers/StatusSelect'
import TimePeriodPicker from './Pickers/TimePeriodPicker'
import { getLabelOfProp } from '../../lib/props'

interface PropPickerProps {
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
  propName: string
  propData: NullablePropData
  readOnly?: boolean
  onUpdate?: (newProps: Props) => void
  portalId?: string
}

const PropPicker = ({
  parent,
  propName,
  propData,
  onUpdate,
  readOnly = false,
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

  switch (propData.type) {
    case 'user':
      return (
        <AssigneeSelect
          disabled={sendingMap.get(parent.target.id) != null || readOnly}
          isLoading={sendingMap.get(parent.target.id) === propName}
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
              val.length === 0 ? null : { type: 'user', data: val as any }
            )
          }
        />
      )
    case 'date':
      return (
        <DueDateSelect
          disabled={sendingMap.get(parent.target.id) != null || readOnly}
          sending={sendingMap.get(parent.target.id) === propName}
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
                : null
            )
          }
        />
      )
    case 'string':
      if (toLower(propName) === 'status') {
        return (
          <StatusSelect
            status={
              typeof propData.data === 'string'
                ? (propData.data as DocStatus)
                : null
            }
            sending={sendingMap.get(parent.target.id) === 'status'}
            disabled={sendingMap.get(parent.target.id) != null || readOnly}
            isReadOnly={readOnly}
            onStatusChange={(val) =>
              updateProp(
                val != null
                  ? {
                      type: 'string',
                      data: val,
                    }
                  : null
              )
            }
          />
        )
      } else {
        return null
      }
    case 'json':
      if (
        propData.data != null &&
        propData.data.dataType === 'timeperiod' &&
        (propData.data.data == null || typeof propData.data.data === 'number')
      ) {
        return (
          <TimePeriodPicker
            label={getLabelOfProp(propName)}
            isReadOnly={readOnly}
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
