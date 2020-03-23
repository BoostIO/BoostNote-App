import React from 'react'
import { usePreferences } from '../../../lib/preferences'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarButton from '../atoms/TopBarButton'
import Icon from '../atoms/Icon'
import { mdiClose } from '@mdi/js'
import styled from '../../../lib/styled'
import { backgroundColor } from '../../../lib/styled/styleFunctions'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton
} from '../../../components/PreferencesModal/styled'
import LoginButton from '../../../components/atoms/LoginButton'
import UserInfo from '../molecules/UserInfo'
import { useUsers } from '../../../lib/accounts'
import { IconArrowRotate } from '../../../components/icons'

const PreferencesModalContainer = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${backgroundColor}
  display: flex;
  overflow: hidden;
`

const ContentContainer = styled.div`
  padding: 15px;
`

const PreferencesModal = () => {
  const { closed, toggleClosed } = usePreferences()
  const [users, { removeUser }] = useUsers()

  if (closed) {
    return null
  }

  return (
    <PreferencesModalContainer>
      <TopBarLayout
        title='Preferences'
        leftControl={
          <TopBarButton onClick={toggleClosed}>
            <Icon path={mdiClose} />
          </TopBarButton>
        }
      >
        <ContentContainer>
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
        </ContentContainer>
      </TopBarLayout>
    </PreferencesModalContainer>
  )
}

export default PreferencesModal
