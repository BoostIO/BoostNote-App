import React, { useState, useCallback, FormEventHandler } from 'react'
import styled from '../../../lib/styled'
import CustomButton from '../../atoms/buttons/CustomButton'
import { Spinner } from '../../atoms/Spinner'
import CustomLink from '../../atoms/Link/CustomLink'
import { stringify } from 'querystring'
import cc from 'classcat'
import { createLoginEmailRequest } from '../../../api/auth/email'

interface EmailFormProps {
  query?: any
  disabled: boolean
  setDisabled: (val: boolean) => void
  setError: (err: unknown) => void
  email?: string
}

const EmailForm = ({
  query,
  disabled,
  setDisabled,
  setError,
  email: initialEmail = '',
}: EmailFormProps) => {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState<string>(initialEmail)
  const [code, setCode] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)

  const emailChangeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setEmail(event.target.value)
      setStep('email')
    },
    [setEmail]
  )

  const codeChangeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setCode(event.target.value)
    },
    [setCode]
  )

  const onSubmit: FormEventHandler = useCallback(
    async (event) => {
      event?.preventDefault()
      if (disabled || sending || step === 'code') {
        return
      }
      setSending(true)
      setDisabled(true)

      try {
        await createLoginEmailRequest({ email, ...query })
        setStep('code')
      } catch (error) {
        setError(error)
      }

      setSending(false)
      setDisabled(false)
    },
    [disabled, sending, setDisabled, step, setStep, email, query, setError]
  )

  if (step === 'code') {
    const linkIsDisabled = code.length < 7 || disabled
    return (
      <StyledEmailForm onSubmit={onSubmit}>
        <label>EMAIL</label>
        <input
          type='text'
          value={email}
          placeholder='Email...'
          onChange={emailChangeHandler}
        />
        <p className='text-center'>
          We just sent a temporary signin code to your email. <br /> Please
          check your inbox.
        </p>
        <input
          type='text'
          value={code}
          placeholder='Paste signin code'
          onChange={codeChangeHandler}
        />
        <CustomLink
          variant='primary'
          className={cc(['submit-email', linkIsDisabled && 'disabled'])}
          onClick={() => {
            setDisabled(true)
            setSending(true)
          }}
          href={
            !linkIsDisabled
              ? `/api/oauth/email/callback?${stringify({ code, email })}`
              : '#'
          }
        >
          {sending ? (
            <Spinner className='relative' />
          ) : (
            'Continue with signin code'
          )}
        </CustomLink>
      </StyledEmailForm>
    )
  }

  return (
    <StyledEmailForm onSubmit={onSubmit}>
      <label>EMAIL</label>
      <input
        type='text'
        value={email}
        placeholder='Email...'
        onChange={emailChangeHandler}
      />
      <CustomButton
        className='submit-email'
        variant='primary'
        type='submit'
        disabled={disabled}
      >
        {sending ? <Spinner className='relative' /> : 'Continue with email'}
      </CustomButton>
    </StyledEmailForm>
  )
}

export default EmailForm

const StyledEmailForm = styled.form`
  margin-left: auto;
  margin-right: auto;
  color: #9da0a5;
  label {
    display: block;
    margin: ${({ theme }) => theme.space.xxsmall}px auto;
    text-align: left;
    width: 400px;
  }
  input {
    padding: ${({ theme }) => theme.space.xsmall}px
      ${({ theme }) => theme.space.small}px;
    border: none;
    border-radius: 2px;
    border: 1px solid #d2d3d6;
    ::placeholder {
      color: #45474b;
    }
    width: 400px;
    height: 40px;
  }

  .submit-email {
    display: block;
    padding: 0;
    width: 400px;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-align: center;
    margin: ${({ theme }) => theme.space.small}px auto !important;
  }

  a.submit-email.disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  .text-center {
    margin-top: ${({ theme }) => theme.space.small}px;
  }
`
