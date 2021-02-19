import React from 'react'
import { ServiceConnectionProvider } from '.'

function withServiceConnections<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: React.PropsWithChildren<T>) => {
    return (
      <ServiceConnectionProvider>
        <Component {...props} />
      </ServiceConnectionProvider>
    )
  }
}

export default withServiceConnections
