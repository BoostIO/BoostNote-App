import React from 'react'
import { OpenInvitesProvider } from '.'

function withOpenInvites<T>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return (props: React.PropsWithChildren<T>) => {
    return (
      <OpenInvitesProvider>
        <Component {...props} />
      </OpenInvitesProvider>
    )
  }
}

export default withOpenInvites
