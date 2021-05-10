import React, { useCallback, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../../../lib/stores/globalData'
import { saveUserInfo, updateUserIcon } from '../../../api/users'
import { buildIconUrl } from '../../../api/files'
import { Spinner } from '../../atoms/Spinner'
import { useSettings } from '../../../lib/stores/settings'
import AccountLink from '../../atoms/Link/AccountLink'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { UserEmailNotificationType } from '../../../interfaces/db/userSettings'
import { saveUserSettings } from '../../../api/users/settings'
import { useToast } from '../../../../shared/lib/stores/toast'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import SettingInput from '../../../../shared/components/organisms/Settings/atoms/SettingInput'
import SettingSelect from '../../../../shared/components/organisms/Settings/atoms/SettingSelect'
import Button from '../../../../shared/components/atoms/Button'
import SettingDivider from '../../../../shared/components/organisms/Settings/atoms/SettingDivider'
import SettingIconInput from '../../../../shared/components/organisms/Settings/molecules/SettingIconInput'

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

  const selectCurrentEmailNotifications: SelectChangeEventHandler = useCallback(
    (event) => {
      let value: UserEmailNotificationType | 'never'
      switch (event.target.value) {
        case 'daily':
        case 'weekly':
          value = event.target.value
          break
        case 'never':
        default:
          value = 'never'
      }
      setCurrentEmailNotifications(value)
    },
    []
  )

  return (
    <SettingTabContent
      title={t('settings.personalInfo')}
      description={'Manage your Boost Note profile.'}
      body={
        <>
          {currentUser != null && (
            <>
              <section>
                <SettingIconInput defaultUrl={iconUrl} onChange={setIconFile} />
              </section>
              <section>
                <SettingInput
                  label={'Name'}
                  value={displayName}
                  onChange={onChangeHandler}
                ></SettingInput>
              </section>
            </>
          )}

          {currentUser != null && (
            <section>
              <SettingSelect
                label={t('settings.notificationsFrequency')}
                value={currentEmailNotifications}
                onChange={selectCurrentEmailNotifications}
                disabled={updating}
                options={
                  <>
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
                      value='never'
                      selected={currentEmailNotifications == null}
                    >
                      Never
                    </option>
                  </>
                }
              ></SettingSelect>
            </section>
          )}

          <section>
            <Button
              variant='primary'
              onClick={updateHandler}
              disabled={updating}
            >
              {updating ? (
                <Spinner style={{ fontSize: 16 }} />
              ) : (
                t('general.update')
              )}
            </Button>
          </section>
        </>
      }
      footer={
        <>
          <SettingDivider />
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
