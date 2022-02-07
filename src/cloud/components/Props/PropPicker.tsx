import React, { useCallback } from 'react'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import {
  SerializedPropData,
  PropData,
  Props,
  NullablePropData,
  SerializedCompoundProp,
} from '../../interfaces/db/props'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import AssigneeSelect from './Pickers/AssigneeSelect'
import DatePropPicker from './Pickers/DatePropPicker'
import StatusSelect from './Pickers/StatusSelect'
import TimePeriodPicker from './Pickers/TimePeriodPicker'
import { mdiAlertOutline } from '@mdi/js'
import PropertyValueButton from './Pickers/PropertyValueButton'
import WithTooltip from '../../../design/components/atoms/WithTooltip'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import NumberSelect from './Pickers/NumberSelect'
import TextSelect from './Pickers/TextSelect'
import { getISODateFromLocalTime } from '../../lib/date'
import UrlSelect from './Pickers/UrlSelect'
import DocDependencySelect from './Pickers/DocDependencySelect'
import CheckboxSelect from './Pickers/CheckboxSelect'
import { IconSize } from '../../../design/components/atoms/Icon'

interface PropPickerProps {
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
  propName: string
  propData: SerializedPropData
  readOnly?: boolean
  isErrored?: boolean
  showIcon?: boolean
  iconSize?: IconSize
  showPropName?: boolean
  emptyLabel?: string
  onUpdate?: (newProps: Props) => void
}

const PropPicker = ({
  parent,
  propName,
  propData,
  onUpdate,
  readOnly = false,
  isErrored,
  showIcon,
  emptyLabel,
  showPropName = false,
  iconSize = 20,
}: PropPickerProps) => {
  const { sendingMap, updateDocPropsApi } = useCloudApi()

  const updateProp = useCallback(
    async (newData: PropData | null) => {
      const res = await updateDocPropsApi(parent.target, [propName, newData])
      if (newData != null) {
        trackEvent(MixpanelActionTrackTypes.DocPropUpdateValue, {
          propName,
          propType: newData.type,
        })
      }

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

  return (
    <PropPickerRaw
      propName={propName}
      propData={propData}
      updateProp={updateProp}
      readOnly={readOnly}
      showIcon={showIcon}
      emptyLabel={emptyLabel}
      disabled={sendingMap.get(parent.target.id) != null || readOnly}
      isLoading={sendingMap.get(parent.target.id) === propName}
      sending={sendingMap.get(parent.target.id) === propName}
      showPropName={showPropName}
      iconSize={iconSize}
    />
  )
}

export default PropPicker

type PropPickerRawProps = Omit<
  PropPickerProps,
  'parent' | 'onUpdate' | 'isErrored'
> & {
  sending?: boolean
  disabled: boolean
  isLoading: boolean
  updateProp: (data: PropData | null) => void
}

export const PropPickerRaw = ({
  propName,
  propData,
  updateProp,
  readOnly = false,
  showIcon,
  emptyLabel,
  disabled,
  sending,
  isLoading,
  showPropName,
  iconSize,
}: PropPickerRawProps) => {
  switch (propData.type) {
    case 'user':
      return (
        <AssigneeSelect
          disabled={disabled || readOnly}
          isLoading={isLoading}
          readOnly={readOnly}
          emptyLabel={emptyLabel}
          defaultValue={
            propData.data != null
              ? Array.isArray(propData.data)
                ? propData.data
                    .filter((item) => item != null)
                    .map((item) => item!.userId)
                : [propData.data.userId]
              : []
          }
          showIcon={showIcon}
          update={(val) =>
            updateProp(
              val.length === 0 || val == null
                ? { type: 'user', data: null }
                : {
                    type: 'user',
                    data: val.filter((userId) => userId != null) as any,
                  }
            )
          }
        />
      )
    case 'date':
      return (
        <DatePropPicker
          sending={sending}
          disabled={disabled || readOnly}
          isReadOnly={readOnly}
          emptyLabel={emptyLabel}
          date={propData.data == null ? null : (propData.data as any)}
          onDueDateChange={(newDate: Date | Date[] | null) =>
            updateProp(
              newDate != null
                ? {
                    type: 'date',
                    data: Array.isArray(newDate)
                      ? newDate.map((date) => getISODateFromLocalTime(date))
                      : getISODateFromLocalTime(newDate),
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
            (Array.isArray(propData.data) ? propData.data[0] : propData.data) ||
            undefined
          }
          sending={sending}
          disabled={disabled || readOnly}
          emptyLabel={emptyLabel}
          isReadOnly={readOnly}
          showIcon={showIcon}
          onStatusChange={(val) =>
            updateProp({
              type: 'status',
              data: val == null ? val : val.id,
            })
          }
        />
      )
    case 'number':
      switch (propData.subType) {
        case 'checkbox':
          const isChecked =
            ((Array.isArray(propData.data)
              ? propData.data[0]
              : propData.data) || undefined) === 1

          return showPropName ? (
            <WithTooltip tooltip={propName}>
              <CheckboxSelect
                value={isChecked}
                iconSize={iconSize}
                isReadOnly={readOnly}
                onCheckboxToggle={() =>
                  updateProp({
                    type: 'number',
                    subType: 'checkbox',
                    data: isChecked ? 0 : 1,
                  })
                }
                showIcon={showIcon}
                sending={sending}
                disabled={sending || readOnly}
              />
            </WithTooltip>
          ) : (
            <CheckboxSelect
              value={isChecked}
              iconSize={iconSize}
              isReadOnly={readOnly}
              onCheckboxToggle={() =>
                updateProp({
                  type: 'number',
                  subType: 'checkbox',
                  data: isChecked ? 0 : 1,
                })
              }
              showIcon={showIcon}
              sending={sending}
              disabled={sending || readOnly}
            />
          )
        case 'timeperiod':
          return (
            <TimePeriodPicker
              modalLabel={propName}
              isReadOnly={readOnly}
              emptyLabel={emptyLabel}
              sending={sending}
              disabled={sending || readOnly}
              value={
                Array.isArray(propData.data) ? propData.data[0] : propData.data
              }
              onPeriodChange={(val) => {
                updateProp({
                  type: 'number',
                  subType: 'timeperiod',
                  data: val,
                })
              }}
            />
          )
        default:
          return (
            <NumberSelect
              number={
                (Array.isArray(propData.data)
                  ? propData.data[0]
                  : propData.data) || undefined
              }
              sending={sending}
              disabled={sending || readOnly}
              emptyLabel={emptyLabel}
              isReadOnly={readOnly}
              showIcon={showIcon}
              onNumberChange={(val) =>
                updateProp({
                  type: 'number',
                  data: val,
                })
              }
            />
          )
      }
    case 'string':
      if (propData.subType === 'url') {
        return (
          <UrlSelect
            value={
              (Array.isArray(propData.data)
                ? propData.data[0]
                : propData.data) || undefined
            }
            sending={sending}
            disabled={sending || readOnly}
            isReadOnly={readOnly}
            showIcon={showIcon}
            onUrlChange={(val) =>
              updateProp({
                type: 'string',
                subType: 'url',
                data: val,
              })
            }
          />
        )
      }

      return (
        <TextSelect
          value={
            (Array.isArray(propData.data) ? propData.data[0] : propData.data) ||
            undefined
          }
          sending={sending}
          disabled={disabled || readOnly}
          isReadOnly={readOnly}
          showIcon={showIcon}
          onTextChange={(val) =>
            updateProp({
              type: 'string',
              data: val,
            })
          }
        />
      )
    case 'compound':
      if (propData.subType === 'dependency') {
        return (
          <DocDependencySelect
            disabled={sending || readOnly}
            isLoading={sending === true}
            readOnly={readOnly}
            emptyLabel={emptyLabel}
            defaultValue={
              propData.data != null
                ? Array.isArray(propData.data)
                  ? (propData.data.filter((item) => item != null) as any)
                  : [propData.data]
                : []
            }
            showIcon={showIcon}
            update={(val) =>
              updateProp(
                val.length === 0 || val == null
                  ? { type: 'compound', subType: 'dependency', data: null }
                  : {
                      type: 'compound',
                      subType: 'dependency',
                      data: val as NullablePropData<SerializedCompoundProp>,
                    }
              )
            }
          />
        )
      }

      return null
    default:
      return null
  }
}
