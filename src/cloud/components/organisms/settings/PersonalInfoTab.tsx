import React, { useCallback, useState, useMemo } from 'react'
import {
  SectionLabel,
  SectionInput,
  SectionProfilePic,
  SectionFlexLeft,
  SectionSeparator,
  SectionDescription,
  SectionSelect,
  SectionHeader3,
  SectionHeader2,
} from './styled'
import { useTranslation } from 'react-i18next'
import { useGlobalData } from '../../../lib/stores/globalData'
import { saveUserInfo, updateUserIcon } from '../../../api/users'
import { buildIconUrl } from '../../../api/files'
import IconInput from '../../molecules/IconInput'
import CustomButton from '../../atoms/buttons/CustomButton'
import { Spinner } from '../../atoms/Spinner'
import { useSettings } from '../../../lib/stores/settings'
import AccountLink from '../../atoms/Link/AccountLink'
import { SelectChangeEventHandler } from '../../../lib/utils/events'
import { UserEmailNotificationType } from '../../../interfaces/db/userSettings'
import { saveUserSettings } from '../../../api/users/settings'
import { useToast } from '../../../../shared/lib/stores/toast'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

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
      header={t('settings.personalInfo')}
      body={
        <>
          <section>
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
                <SectionHeader2>{t('settings.notifications')}</SectionHeader2>
                <section>
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
                      value='never'
                      selected={currentEmailNotifications == null}
                    >
                      Never
                    </option>
                  </SectionSelect>
                </section>
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
          </section>
          <SectionSeparator style={{ marginTop: 20 }} />
          <section>
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
          </section>
        </>
      }
    ></SettingTabContent>
  )
}

export default PersonalInfoTab
