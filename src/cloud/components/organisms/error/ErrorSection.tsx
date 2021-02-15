import React from 'react'
import styled from '../../../lib/styled'

interface ErrorSectionProps {
  statusCode?: number
  message?: string
  stack?: string
}

const ErrorSection = ({ statusCode, message, stack }: ErrorSectionProps) => (
  <StyledErrorSection>
    {statusCode != null ? (
      <h1>{statusCode}</h1>
    ) : (
      <h1 className='text-muted'>Unknown Status</h1>
    )}
    <p>{message}</p>
    {stack != null && (
      <pre>
        <code>{stack}</code>
      </pre>
    )}
  </StyledErrorSection>
)

export default ErrorSection

const StyledErrorSection = styled.div`
  border: 1px solid red;
  background: rgba(200, 0, 0, 0.6);
  color: #fff;
  padding: ${({ theme }) => theme.space.xsmall}px 2%;
  border-radius: 5px;
  width: 100%;
  margin-bottom: 15px;

  h1 {
    padding: ${({ theme }) => theme.space.xxsmall}px 0;
    margin: 0;
  }

  p {
    margin: 0;
  }

  pre {
    overflow: auto;
    padding-bottom: ${({ theme }) => theme.space.xsmall}px;
    code {
    }
  }
`
