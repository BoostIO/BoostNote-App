import React from 'react'

interface ErrorInitialProps {
  res: any
  err: any
}

const Error = () => {
  return <></>
}

Error.getInitialProps = ({ res, err }: ErrorInitialProps) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  const message =
    statusCode === 404
      ? 'The page could not be found.'
      : res
      ? res.message
      : err
      ? err.message
      : 'Error'
  return { error: { statusCode, message } }
}

export default Error
