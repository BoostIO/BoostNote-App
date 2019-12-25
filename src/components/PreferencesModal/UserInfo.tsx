import React from 'react'
import { User } from '../../lib/accounts/users'
import styled from '../../lib/styled'
import MdiIcon from '@mdi/react'
import { mdiAccount } from '@mdi/js'
import { SectionPrimaryButton } from './styled'
import { useTranslation } from 'react-i18next'

interface UserProps {
  user: User
  signout: (user: User) => void
}

const Container = styled.div`
  margin-bottom: 8px;
`

export default ({ user, signout }: UserProps) => {
  const { t } = useTranslation()

  return (
    <Container>
      <MdiIcon path={mdiAccount} size='80px' />
      <p>{user.name}</p>
      <SectionPrimaryButton onClick={() => signout(user)}>
        {t('general.signOut')}
      </SectionPrimaryButton>
    </Container>
  )
}
