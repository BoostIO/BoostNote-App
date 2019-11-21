import React from 'react'
import { User } from '../../lib/accounts/users'
import MdiIcon from '@mdi/react'
import { mdiAccount } from '@mdi/js'

interface UserProps {
  user: User
  signout: (user: User) => void
}

export default ({ user, signout }: UserProps) => (
  <div>
    <MdiIcon path={mdiAccount} size='80px' />
    <p>{user.name}</p>
    <button onClick={() => signout(user)}>Sign Out</button>
  </div>
)
