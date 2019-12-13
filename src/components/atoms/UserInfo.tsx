import React from 'react'
import { User } from '../../lib/accounts/users'

interface UserProps {
  user: User
  signout: (user: User) => void
}

export default ({ user, signout }: UserProps) => (
  <div>
    <p>{user.name}</p>
    <button onClick={() => signout(user)}>Sign Out</button>
  </div>
)
