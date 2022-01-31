import React from 'react'
import { LoaderPropsProvider } from '.'

function withLoaderProps<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: React.PropsWithChildren<T>) => {
    return (
      <LoaderPropsProvider>
        <Component {...props} />
      </LoaderPropsProvider>
    )
  }
}

export default withLoaderProps
