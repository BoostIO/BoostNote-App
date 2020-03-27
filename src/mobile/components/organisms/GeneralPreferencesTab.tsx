import React, { useCallback } from 'react'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton,
  SectionControl,
} from '../../../components/PreferencesModal/styled'
import LoginButton from '../../../components/atoms/LoginButton'
import UserInfo from '../molecules/UserInfo'
import { useUsers } from '../../../lib/accounts'
import { IconArrowRotate } from '../../../components/icons'
import { FormCheckItem } from '../../../components/atoms/form'
import { usePreferences } from '../../../lib/preferences'

const GeneralPreferencesTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const [users, { removeUser }] = useUsers()

  const toggleEnableAutoSync: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPreferences({
        'general.enableAutoSync': event.target.checked,
      })
    },
    [setPreferences]
  )

  return (
    <div>
      <Section>
        <SectionHeader>Account</SectionHeader>
        <div>
          {users.map((user) => (
            <UserInfo key={user.id} user={user} signout={removeUser} />
          ))}
          {users.length === 0 && (
            <LoginButton
              onErr={(error) => console.error(error)}
              ButtonComponent={SectionPrimaryButton}
            >
              {(loginState) =>
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

      <Section>
        <SectionHeader>Enable auto sync</SectionHeader>
        <SectionControl>
          <FormCheckItem
            id='checkbox-enable-auto-sync'
            type='checkbox'
            checked={preferences['general.enableAutoSync']}
            onChange={toggleEnableAutoSync}
          >
            Enable auto sync
          </FormCheckItem>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralPreferencesTab
