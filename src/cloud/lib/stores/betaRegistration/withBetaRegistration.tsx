import React from 'react'
import { BetaRegistrationProvider } from '.'

function withApiTokens<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: React.PropsWithChildren<T>) => {
    return (
      <BetaRegistrationProvider>
        <Component {...props} />
      </BetaRegistrationProvider>
    )
  }
}

export default withApiTokens
