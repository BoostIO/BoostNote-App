import React, { ComponentType, useMemo, PropsWithChildren } from 'react'
import { SerializedUser } from '../../cloud/interfaces/db/user'
import { usePage } from '../../cloud/lib/stores/pageStore'

export function withLiveUser<
  T extends PropsWithChildren<{ user: SerializedUser }>
>(Component: ComponentType<T>): ComponentType<T> {
  return (props: T) => {
    const { permissions } = usePage()

    const normalizedUser = useMemo(() => {
      if (permissions == null) {
        return props.user
      }

      const permission = permissions.find((permission) => permission.user.id)
      return permission != null ? permission.user : props.user
    }, [props.user, permissions])

    return (
      <Component {...props} user={normalizedUser}>
        {props.children}
      </Component>
    )
  }
}
