import React, { useState } from 'react'
import styled from '../../../lib/styled'
import { LoadingButton } from '../../atoms/Button'
import cc from 'classcat'
import { AppComponent } from '../../../lib/types'
import FormRow, { FormRowProps, FormRowButtonProps } from './templates/FormRow'

interface FormProps {
  rows: FormRowProps[]
  onSubmit?: React.FormEventHandler
  submitButton?: FormRowButtonProps
  onCancel?: () => void
}

const Form: AppComponent<FormProps> = ({
  onSubmit,
  rows,
  submitButton,
  children,
  className,
}) => {
  const [submitState, setSubmitState] = useState(false)
  return (
    <Container
      onSubmit={async (event: React.FormEvent) => {
        if (onSubmit == null) {
          return
        }

        event.preventDefault()
        setSubmitState(true)
        new Promise(async (resolve) => {
          await onSubmit(event)
          setSubmitState(false)
          resolve(true)
        })
      }}
      className={cc(['form', className])}
    >
      {rows.map((row, i) => {
        return <FormRow row={row} className='form__row' key={`row--${i}`} />
      })}
      {children}
      {submitButton != null && (
        <div className='form__row'>
          <LoadingButton
            {...submitButton}
            spinning={submitState || submitButton.spinning}
            variant='primary'
            type='submit'
          >
            {submitButton.label}
          </LoadingButton>
        </div>
      )}
    </Container>
  )
}

export default Form

const Container = styled.form`
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .form__row + .form__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }
`
