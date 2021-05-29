import React, { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import ColoredBlock from './ColoredBlock'
import { nodeEnv } from '../../lib/consts'
import ky from 'ky'

interface ErrorAlertProps {
  error: unknown
  style?: React.CSSProperties
}

const ErrorBlock = ({ error, style }: ErrorAlertProps) => {
  const [message, setMessage] = useState<React.ReactNode>()

  useEffect(() => {
    try {
      async function fetchData() {
        const rawMessage = (await getErrorMessage(error)) || ''
        if (nodeEnv === 'development') {
          setMessage(
            rawMessage.split('\n').map((message, index) => {
              return <li key={index}>{message}</li>
            })
          )
          return
        }
        const lines = rawMessage.split('\n')
        setMessage(<li>{lines[0]}</li>)
        return
      }
      fetchData()
      return
    } catch (err) {
      setMessage(<li>{String(error)}</li>)
      return
    }
  }, [error])

  return (
    <ColoredBlock variant='danger' style={{ ...style }}>
      <ul
        className='list-unstyled'
        style={{ paddingLeft: 0, listStyle: 'none' }}
      >
        {message}
      </ul>
    </ColoredBlock>
  )
}

export default ErrorBlock

export async function getErrorMessage(error: unknown): Promise<string> {
  if (error instanceof ky.HTTPError) {
    const message = await error.response.text()
    return message
  }

  if (isAxiosError(error)) {
    return error.response!.data
  }
  return (error as Error).message
}

function isAxiosError(error: unknown): error is AxiosError {
  if ((error as AxiosError).response != null) {
    return true
  }
  return false
}
