import React, {
  useState,
  useCallback,
  useMemo,
  ChangeEventHandler,
  FormEventHandler,
} from 'react'
import styled from 'styled-components'
import { space, color, typography } from 'styled-system'
import axios from 'axios'
import Button from '../atoms/Button'

const BoosthubBetaForm = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState()
  const [sending, setSending] = useState(false)
  const [created, setCreated] = useState(false)

  const onEmailChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setCreated(false)
      setError(undefined)
      setEmail(event.target.value)
    },
    [setEmail]
  )

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setError(undefined)
    setSending(true)

    try {
      const { registration } = await createBetaRegistration(email)
      setEmail('')
      setCreated(registration != null)
      setSending(false)
    } catch (error) {
      setError(error)
      setSending(false)
    }
  }

  const buttonLabel = useMemo(() => {
    if (sending) {
      return `Registering...`
    }

    if (created) {
      return `Registered ✓`
    }

    return 'Get early access'
  }, [created, sending])

  const ErrorBlock = useMemo(() => {
    if (error == null) {
      return null
    }

    const rawMessage = getErrorMessage(error)
    return (
      <StyledColoredBlock>
        <ul>
          {rawMessage.split('\n').map((message, index) => {
            return <li key={index}>{message}</li>
          })}
        </ul>
      </StyledColoredBlock>
    )
  }, [error])

  return (
    <StyledBetaForm onSubmit={onSubmit}>
      <div className='flex'>
        <input
          type='text'
          placeholder='Email...'
          value={email}
          onChange={onEmailChangeHandler}
        />
        <Button type='submit' disabled={sending}>
          {buttonLabel}
        </Button>
      </div>

      {ErrorBlock}
    </StyledBetaForm>
  )
}

const StyledBetaForm = styled.form`
  max-width: 500px;
  ${space}
  ${color}
  ${typography}
  .flex {
    display: flex;
    margin-bottom: ${({ theme }) => theme.space.xsmall}px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  input {
    background-color: ${({ theme }) => theme.secondaryBackgroundColor};
    color: ${({ theme }) => theme.emphasizedTextColor};
    margin-bottom: 10px;

    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryShadowColor};
    }
    border: 1px solid #ddd;
    padding: 20px 10px;
    border-radius: 2px;
    flex-grow: 1;
    flex-shrink: 1;
    font-size: 18px;
  }

  button {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-bottom: 10px;
    background-color: #005868;
    color: #fff;
    text-transform: uppercase;
    border-radius: 5px;
    color: ${({ theme }) => theme.whiteTextColor};
    cursor: pointer;
    font-size: 18px;
    height: 60px;
    line-height: 1;
    outline: 0;
    border: solid 1px rgba(12,24,39,.64);

    &:hover {
      cursor: pointer;
      transform: translateY(-3px);
      transition: .2s cubic-bezier(0, 0, .25, 1);
    }
    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryShadowColor};
    }

    &.active {
      background-color: ${({ theme }) => theme.primaryBackgroundColor};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    margin-left: 10px;
  }
`

const StyledColoredBlock = styled.div`
  margin-top: 10px;
  position: relative;
  padding: 0.3rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  color: #61050d;
  background-color: #f7d9dc;
  border-color: #f3c6ca;

  ul {
    list-style: none;
  }
`

export default BoosthubBetaForm

function getErrorMessage(error: any): string {
  if (isAxiosError(error)) {
    return error.response.data.message
  }
  return error.message
}

function isAxiosError(error: unknown) {
  if ((error as any).response != null) {
    return true
  }
  return false
}

async function createBetaRegistration(email: string) {
  const client = axios.create()
  client.defaults.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const response = await client.post(
    `https://hub.boostio.co/api/beta/registrations`,
    { email: email }
  )
  return response.data
}
