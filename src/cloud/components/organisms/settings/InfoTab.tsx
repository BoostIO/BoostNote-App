import React, { useCallback, useState, useMemo } from 'react'
import {
  SectionLabel,
  SectionInput,
  SectionProfilePic,
  SectionFlexLeft,
  SectionSeparator,
  SectionDescription,
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
import styled from '../../../lib/styled'
import {
  baseButtonStyle,
  dangerButtonStyle,
} from '../../../lib/styled/styleFunctions'
import { useToast } from '../../../../shared/lib/stores/toast'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'

const InfoTab = () => {
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
  const { closeSettingsTab } = useSettings()

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
      setPartialGlobalData({ currentUser: user })
    } catch (error) {
      pushMessage({
        title: 'Error',
        description: `Could not update your user information`,
      })
    }
    setUpdating(false)
  }, [
    updating,
    displayName,
    currentUser,
    iconFile,
    setPartialGlobalData,
    pushMessage,
  ])

  const iconUrl = useMemo(() => {
    if (currentUser == null || currentUser.icon == null) {
      return undefined
    }
    return buildIconUrl(currentUser.icon.location)
  }, [currentUser])

  return (
    <SettingTabContent
      header={t('settings.info')}
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
          <SectionSeparator />
          <section>
            <StyledInfoTabDelete>
              <SectionDescription>
                {t('settings.account.delete')}
              </SectionDescription>
              <SectionDescription>
                You may delete your account at any time, note that this is
                unrecoverable.{' '}
              </SectionDescription>
              <AccountLink
                intent='delete'
                beforeNavigate={closeSettingsTab}
                className='delete-link'
              >
                {t('general.delete')}
              </AccountLink>
            </StyledInfoTabDelete>
          </section>
        </>
      }
    ></SettingTabContent>
  )
}

const StyledInfoTabDelete = styled.div`
  .delete-link {
    ${baseButtonStyle}
    ${dangerButtonStyle}
    display: inline-block;
    text-decoration: none;
  }
`

export default InfoTab
