import React from 'react'
import { LoaderProvider } from '.'

function withLoaderProps<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: React.PropsWithChildren<T>) => {
    return (
      <LoaderProvider>
        <Component {...props} />
      </LoaderProvider>
    )
  }
}

export default withLoaderProps
