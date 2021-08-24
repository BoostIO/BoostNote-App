import React, { useCallback, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../../lib/stores/globalData'
import { saveUserInfo, updateUserIcon } from '../../api/users'
import { buildIconUrl } from '../../api/files'
import { useSettings } from '../../lib/stores/settings'
import AccountLink from '../Link/AccountLink'
import { UserEmailNotificationType } from '../../interfaces/db/userSettings'
import { saveUserSettings } from '../../api/users/settings'
import { useToast } from '../../../design/lib/stores/toast'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import Form from '../../../design/components/molecules/Form'
import { lngKeys } from '../../lib/i18n/types'
import { FormSelectOption } from '../../../design/components/molecules/Form/atoms/FormSelect'
import { allowedUploadSizeInMb } from '../../lib/upload'

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
        try {
          const { icon } = await updateUserIcon(iconFile)
          user.icon = icon
        } catch (error) {
          if (error.response.status === 413) {
            pushMessage({
              title: 'Error',
              description: `Your file is too big`,
            })
          } else {
            pushMessage({
              title: error.response.status,
              description: error.message,
            })
          }
        }
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
    (formOption: FormSelectOption) => {
      const value = formOption.value || 'never'
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
      title={t(lngKeys.SettingsAccount)}
      description={t(lngKeys.ManageProfile)}
      body={
        currentUser == null ? null : (
          <Form
            onSubmit={updateHandler}
            rows={[
              {
                title: t(lngKeys.GeneralProfilePicture),
                description: t(lngKeys.UploadLimit, {
                  sizeInMb: allowedUploadSizeInMb,
                }),
                items: [
                  {
                    type: 'image',
                    props: { defaultUrl: iconUrl, onChange: setIconFile },
                  },
                ],
              },
              {
                title: t(lngKeys.GeneralName),
                items: [
                  {
                    type: 'input',
                    props: { value: displayName, onChange: onChangeHandler },
                  },
                ],
              },
              {
                title: t(lngKeys.SettingsNotifFrequencies),
                items: [
                  {
                    type: 'select',
                    props: {
                      value: {
                        label:
                          currentEmailNotifications === 'daily'
                            ? t(lngKeys.GeneralDaily)
                            : currentEmailNotifications === 'weekly'
                            ? t(lngKeys.GeneralWeekly)
                            : t(lngKeys.GeneralNever),
                        value: currentEmailNotifications,
                      },
                      onChange: selectCurrentEmailNotifications,
                      isDisabled: updating,
                      options: [
                        { label: t(lngKeys.GeneralDaily), value: 'daily' },
                        { label: t(lngKeys.GeneralWeekly), value: 'weekly' },
                        { label: t(lngKeys.GeneralNever), value: 'never' },
                      ],
                    },
                  },
                ],
              },
            ]}
            submitButton={{
              variant: 'primary',
              spinning: updating,
              label: t(lngKeys.GeneralUpdate),
              disabled: updating,
            }}
          />
        )
      }
      footer={
        <>
          <h2>{t(lngKeys.SettingsAccountDelete)}</h2>
          <p className='text--subtle'>
            {t(lngKeys.SettingsAccountDeleteWarning)}.{' '}
            <AccountLink beforeNavigate={closeSettingsTab} intent='delete'>
              {t(lngKeys.GeneralDelete)}
            </AccountLink>
          </p>
        </>
      }
    ></SettingTabContent>
  )
}

export default PersonalInfoTab
