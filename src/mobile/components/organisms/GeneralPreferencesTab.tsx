import React from 'react'
import PageContainer from '../../../components/atoms/PageContainer'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton
} from '../../../components/PreferencesModal/styled'
import LoginButton from '../../../components/atoms/LoginButton'
import UserInfo from '../molecules/UserInfo'
import { useUsers } from '../../../lib/accounts'
import { IconArrowRotate } from '../../../components/icons'

const GeneralPreferencesTab = () => {
  const [users, { removeUser }] = useUsers()
  return (
    <PageContainer>
      <Section>
        <SectionHeader>Account</SectionHeader>
        <div>
          {users.map(user => (
            <UserInfo key={user.id} user={user} signout={removeUser} />
          ))}
          {users.length === 0 && (
            <LoginButton
              onErr={error => console.error(error)}
              ButtonComponent={SectionPrimaryButton}
            >
              {loginState =>
                loginState !== 'logging-in' ? (
                  <>Sign in</>
                ) : (
                  <>
                    <IconArrowRotate />
                    Loggin in...
                  </>
                )
              }
            </LoginButton>
          )}
        </div>
      </Section>
    </PageContainer>
  )
}

export default GeneralPreferencesTab
