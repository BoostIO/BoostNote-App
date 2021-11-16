import { mdiClockOutline } from '@mdi/js'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import cc from 'classcat'
import Form from '../../../../design/components/molecules/Form'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../design/components/molecules/Form/templates/FormRowItem'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import { SimpleFormSelect } from '../../../../design/components/molecules/Form/atoms/FormSelect'
import LeftRightList from '../../../../design/components/atoms/LeftRightList'
import { useEffectOnce } from 'react-use'
import Button from '../../../../design/components/atoms/Button'
import plur from 'plur'

interface TimePeriodPickerProps {
  label: string
  emptyLabel?: string
  sending?: boolean
  value?: number | null
  disabled?: boolean
  isReadOnly?: boolean
  isErrored?: boolean
  onPeriodChange: (newVal: number | null) => void
  popupAlignment?: 'bottom-left' | 'top-left'
}

const TimePeriodPicker = ({
  label,
  disabled,
  sending,
  value,
  isErrored,
  isReadOnly = false,
  popupAlignment = 'bottom-left',
  emptyLabel,
  onPeriodChange,
}: TimePeriodPickerProps) => {
  const { openContextModal, closeAllModals } = useModal()

  const parsedValue:
    | {
        value: string
        reason: ReasonType
      }
    | undefined = useMemo(() => {
    if (value == null || typeof value !== 'number') {
      return undefined
    }

    let parsedValue

    for (let i = 0; i < reasons.length; i++) {
      const reasonMultipler = getReasonMultiplier(reasons[i])
      if (value % reasonMultipler === 0) {
        parsedValue = {
          value: (value / reasonMultipler).toString(),
          reason: reasons[i],
        }
      }
    }

    if (parsedValue == null) {
      return undefined
    }

    return parsedValue
  }, [value])

  return (
    <Container>
      <PropertyValueButton
        disabled={disabled}
        empty={parsedValue == null}
        isReadOnly={isReadOnly}
        isErrored={isErrored}
        iconPath={mdiClockOutline}
        sending={sending}
        onClick={(e) =>
          openContextModal(
            e,
            <TimePeriodModal
              label={label}
              defaultValue={parsedValue?.value}
              defaultReason={parsedValue?.reason}
              submitUpdate={onPeriodChange}
              closeModal={closeAllModals}
            />,
            {
              alignment: popupAlignment,
              minHeight: 56,
            }
          )
        }
      >
        <span className={cc([])}>
          {parsedValue == null
            ? emptyLabel != null
              ? emptyLabel
              : 'Add'
            : `${parsedValue.value} ${plur(
                parsedValue.reason.slice(0, -1),
                parseInt(parsedValue.value)
              )}`}
        </span>
      </PropertyValueButton>
    </Container>
  )
}

const Container = styled.div``

export default TimePeriodPicker

export const reasons: ReasonType[] = [
  'Seconds',
  'Minutes',
  'Hours',
  'Days',
  'Weeks',
]

export type ReasonType = 'Seconds' | 'Minutes' | 'Hours' | 'Days' | 'Weeks'

const TimePeriodModal = ({
  defaultValue,
  defaultReason = 'Hours',
  label,
  submitUpdate,
  closeModal,
}: {
  label: string
  defaultValue?: string
  defaultReason?: ReasonType
  submitUpdate: (val: number | null) => void
  closeModal: () => void
}) => {
  const [value, setValue] = useState(defaultValue)
  const [reason, setReason] = useState<ReasonType>(defaultReason)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const isValidValue = useMemo(() => {
    return value != null && typeof parseInt(value) === 'number'
  }, [value])

  const submit: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      if (value == null) {
        submitUpdate(null)
        closeModal()
        return
      }

      const parsedValue = parseInt(value)
      if (typeof parsedValue !== 'number') {
        return
      }

      const valueToSeconds = parsedValue * getReasonMultiplier(reason)
      submitUpdate(valueToSeconds)
      closeModal()
      return
    },
    [value, reason, closeModal, submitUpdate]
  )

  return (
    <ModalContainer>
      <LeftRightList ignoreFocus>
        <Form onSubmit={submit}>
          <FormRow>
            <FormRowItem>
              <span className='prop__label'>{label}</span>
            </FormRowItem>
            <FormRowItem>
              <FormInput
                ref={inputRef}
                id='prop__number'
                type='number'
                className='prop__number'
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </FormRowItem>
            <FormRowItem>
              <SimpleFormSelect
                id='prop__reason'
                value={reason}
                options={reasons}
                onChange={(val) => setReason(val as ReasonType)}
              />
            </FormRowItem>
            <FormRowItem flex='0 0 auto'>
              <Button
                variant='primary'
                disabled={
                  defaultValue === value &&
                  reason === defaultReason &&
                  isValidValue
                }
                type='submit'
                id='prop__save'
              >
                Save
              </Button>
            </FormRowItem>
          </FormRow>
        </Form>
      </LeftRightList>
    </ModalContainer>
  )
}

export function getReasonMultiplier(reason: ReasonType) {
  switch (reason) {
    case 'Seconds':
      return 1
    case 'Minutes':
      return 60
    case 'Hours':
      return 60 * 60
    case 'Days':
      return 60 * 60 * 24
    case 'Weeks':
      return 60 * 60 * 24 * 7
  }
}

const ModalContainer = styled.div`
  .prop__label {
    display: flexbox;
    align-items: center;
    white-space: nowrap;
  }

  .prop__number {
    width: 90px;
  }
`
