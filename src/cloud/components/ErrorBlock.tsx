import React, { useEffect, useState } from 'react'
import { nodeEnv } from '../lib/consts'
import ky from 'ky'
import ColoredBlock from '../../design/components/atoms/ColoredBlock'

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

  return typeof error === 'string' ? error : (error as Error).message
}
