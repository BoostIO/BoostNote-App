import React, { useCallback, useState, useMemo } from 'react'
import {
  Section,
  TabHeader,
  SectionLabel,
  SectionInput,
  SectionProfilePic,
  Column,
  Container,
  Scrollable,
  SectionFlexLeft,
  SectionSeparator,
  SectionDescription,
  SectionSelect,
  SectionHeader3,
} from './styled'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../../../lib/stores/globalData'
import { saveUserInfo, updateUserIcon } from '../../../api/users'
import { useToast } from '../../../lib/stores/toast'
import { buildIconUrl } from '../../../api/files'
import IconInput from '../../molecules/IconInput'
import CustomButton from '../../atoms/buttons/CustomButton'
import { Spinner } from '../../atoms/Spinner'
import { useSettings } from '../../../lib/stores/settings'
import AccountLink from '../../atoms/Link/AccountLink'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { UserEmailNotificationType } from '../../../interfaces/db/userSettings'
import { saveUserSettings } from '../../../api/users/settings'

const PersonalInfoTab = () => {
  const {
    globalData: { currentUser },
    setPartialGlobalData,
  } = useGlobalData()

  const { pushMessage } = useToast()
  const [updating, setUpdating] = useState<boolean>(false)
  const [displayName, setDisplayName] = useState<string>(
    currentUser != null ? currentUser.displayName : ''
  )
  const [iconFile, setIconFile] = useState<File | null>(null)
  const { t } = useTranslation()
  const { emailNotifications, closeSettingsTab } = useSettings()
  const [currentEmailNotifications, setCurrentEmailNotifications] = useState(
    emailNotifications
  )

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayName(event.target.value)
    },
    [setDisplayName]
  )

  const updateHandler = useCallback(async () => {
    if (updating) {
      return
    }
    setUpdating(true)
    try {
      await saveUserInfo({ displayName })
      const user = { ...currentUser!, displayName }
      if (iconFile != null) {
        const { icon } = await updateUserIcon(iconFile)
        user.icon = icon
      }
      if (currentEmailNotifications != emailNotifications) {
        const { settings } = await saveUserSettings({
          emailNotifications: currentEmailNotifications,
        })
        setPartialGlobalData({ currentUserSettings: settings })
      }
      setPartialGlobalData({ currentUser: user })
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: `Could not update your user information`,
      })
    }
    setUpdating(false)
  }, [
    displayName,
    pushMessage,
    updating,
    setUpdating,
    currentEmailNotifications,
    emailNotifications,
    setPartialGlobalData,
    currentUser,
    iconFile,
  ])

  const iconUrl = useMemo(() => {
    if (currentUser == null || currentUser.icon == null) {
      return undefined
    }
    return buildIconUrl(currentUser.icon.location)
  }, [currentUser])

  const selectCurrentEmailNotifications: SelectChangeEventHandler = useCallback(
    (event) => {
      const value =
        event.target.value == null
          ? undefined
          : (event.target.value as UserEmailNotificationType)
      setCurrentEmailNotifications(value)
    },
    []
  )

  return (
    <Column>
      <Scrollable>
        <Container>
          <TabHeader className='marginTop'>
            {t('settings.personalInfo')}
          </TabHeader>
          <Section>
            {currentUser != null && (
              <>
                <SectionLabel>Display Name</SectionLabel>
                <SectionInput value={displayName} onChange={onChangeHandler} />
                <SectionProfilePic>
                  <SectionLabel>Icon</SectionLabel>
                  <IconInput
                    shape='square'
                    defaultUrl={iconUrl}
                    onChange={setIconFile}
                  />
                </SectionProfilePic>
              </>
            )}

            {currentUser != null && (
              <>
                <TabHeader style={{ marginTop: 20 }}>
                  {t('settings.notifications')}
                </TabHeader>
                <Section>
                  <SectionHeader3>
                    {t('settings.notificationsFrequency')}
                  </SectionHeader3>
                  <SectionSelect
                    value={currentEmailNotifications}
                    onChange={selectCurrentEmailNotifications}
                    disabled={updating}
                  >
                    <option
                      value='daily'
                      selected={currentEmailNotifications === 'daily'}
                    >
                      Daily
                    </option>
                    <option
                      value='weekly'
                      selected={currentEmailNotifications === 'weekly'}
                    >
                      Weekly
                    </option>
                    <option
                      value={undefined}
                      selected={currentEmailNotifications == null}
                    >
                      {' '}
                      Never
                    </option>
                  </SectionSelect>
                </Section>
              </>
            )}

            <SectionFlexLeft>
              <CustomButton
                variant='primary'
                onClick={updateHandler}
                style={{ marginRight: 10, maxWidth: 150, textAlign: 'center' }}
                disabled={updating}
              >
                {updating ? (
                  <Spinner style={{ fontSize: 16 }} />
                ) : (
                  t('general.update')
                )}
              </CustomButton>
              <CustomButton onClick={closeSettingsTab} variant='secondary'>
                {t('general.cancel')}
              </CustomButton>
            </SectionFlexLeft>
          </Section>
          <SectionSeparator style={{ marginTop: 20 }} />
          <Section>
            <SectionDescription>
              {t('settings.account.delete')}
            </SectionDescription>
            <SectionDescription>
              You may delete your account at any time, note that this is
              unrecoverable.{' '}
              <AccountLink beforeNavigate={closeSettingsTab} intent='delete'>
                {t('general.delete')}
              </AccountLink>
            </SectionDescription>
          </Section>
        </Container>
      </Scrollable>
    </Column>
  )
}

export default PersonalInfoTab
