import React, { useMemo } from 'react'
import { AxiosError } from 'axios'
import ColoredBlock from './ColoredBlock'
import { nodeEnv } from '../../lib/consts'

interface ErrorAlertProps {
  error: unknown
  style?: React.CSSProperties
}

const ErrorBlock = ({ error, style }: ErrorAlertProps) => {
  const errorMessage = useMemo(() => {
    try {
      const rawMessage = getErrorMessage(error)
      if (nodeEnv === 'development') {
        return rawMessage.split('\n').map((message, index) => {
          return <li key={index}>{message}</li>
        })
      }

      const [message] = rawMessage.split('\n')
      return <li>{message}</li>
    } catch (err) {
      return <li>{String(error)}</li>
    }
  }, [error])

  return (
    <ColoredBlock variant='danger' style={{ ...style }}>
      <ul
        className='list-unstyled'
        style={{ paddingLeft: 0, listStyle: 'none' }}
      >
        {errorMessage}
      </ul>
    </ColoredBlock>
  )
}

export default ErrorBlock

export function getErrorMessage(error: unknown): string {
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
