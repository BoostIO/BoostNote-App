import React from 'react'
import { BetaRegistrationProvider } from '.'

function withBetaRegistration<T>(
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

export default withBetaRegistration
