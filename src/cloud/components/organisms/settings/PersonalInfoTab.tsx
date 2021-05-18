import React, { useCallback, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../../../lib/stores/globalData'
import { saveUserInfo, updateUserIcon } from '../../../api/users'
import { buildIconUrl } from '../../../api/files'
import { useSettings } from '../../../lib/stores/settings'
import AccountLink from '../../atoms/Link/AccountLink'
import { UserEmailNotificationType } from '../../../interfaces/db/userSettings'
import { saveUserSettings } from '../../../api/users/settings'
import { useToast } from '../../../../shared/lib/stores/toast'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import Form from '../../../../shared/components/molecules/Form'

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
  const [currentEmailNotifications, setCurrentEmailNotifications] = useState<
    UserEmailNotificationType | 'never'
  >(emailNotifications == null ? 'never' : emailNotifications)

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
          notifications: {
            summary:
              currentEmailNotifications === 'never'
                ? undefined
                : currentEmailNotifications,
          },
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

  const selectCurrentEmailNotifications = useCallback(
    (value: string | 'never') => {
      let targetedValue: UserEmailNotificationType | 'never'
      switch (value) {
        case 'daily':
        case 'weekly':
          targetedValue = value
          break
        case 'never':
        default:
          targetedValue = 'never'
      }
      setCurrentEmailNotifications(targetedValue)
    },
    []
  )

  return (
    <SettingTabContent
      title={t('settings.personalInfo')}
      description={'Manage your Boost Note profile.'}
      body={
        currentUser == null ? null : (
          <Form
            onSubmit={updateHandler}
            rows={[
              {
                title: 'Profile Picture',
                items: [
                  {
                    type: 'image',
                    props: { defaultUrl: iconUrl, onChange: setIconFile },
                  },
                ],
              },
              {
                title: 'Name',
                items: [
                  {
                    type: 'input',
                    props: { value: displayName, onChange: onChangeHandler },
                  },
                ],
              },
              {
                title: t('settings.notificationsFrequency'),
                items: [
                  {
                    type: 'select--string',
                    props: {
                      value: currentEmailNotifications,
                      onChange: selectCurrentEmailNotifications,
                      isDisabled: updating,
                      options: ['daily', 'weekly', 'never'],
                    },
                  },
                ],
              },
            ]}
            submitButton={{
              variant: 'primary',
              spinning: updating,
              label: t('general.update'),
              disabled: updating,
            }}
          />
        )
      }
      footer={
        <>
          <h2>{t('settings.account.delete')}</h2>
          <p className='text--subtle'>
            You may delete your account at any time, note that this is
            unrecoverable.{' '}
            <AccountLink beforeNavigate={closeSettingsTab} intent='delete'>
              {t('general.delete')}
            </AccountLink>
          </p>
        </>
      }
    ></SettingTabContent>
  )
}

export default PersonalInfoTab
