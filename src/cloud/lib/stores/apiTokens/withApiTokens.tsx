import React from 'react'
import { ApiTokensProvider } from '.'

function withApiTokens<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: React.PropsWithChildren<T>) => {
    return (
      <ApiTokensProvider>
        <Component {...props} />
      </ApiTokensProvider>
    )
  }
}

export default withApiTokens
