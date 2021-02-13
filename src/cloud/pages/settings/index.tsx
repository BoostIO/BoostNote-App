import React, { useCallback, useState } from 'react'
import Page from '../../components/Page'
import styled from '../../lib/styled'
import { saveUserInfo, updateUserIcon } from '../../api/users'
import {
  getSettingsPageData,
  SettingsPageResponseBody,
} from '../../api/pages/settings'
import ErrorBlock from '../../components/atoms/ErrorBlock'
import cc from 'classcat'
import { Spinner } from '../../components/atoms/Spinner'
import { baseIconStyle, inputStyle } from '../../lib/styled/styleFunctions'
import Button from '../../components/atoms/Button'
import Flexbox from '../../components/atoms/Flexbox'
import { getTeamURL } from '../../lib/utils/patterns'
import { buildIconUrl } from '../../api/files'
import Icon from '../../components/atoms/Icon'
import { mdiAccountCircleOutline } from '@mdi/js'
import { useGlobalData } from '../../lib/stores/globalData'
import { useRouter } from '../../../lib/router'
import { parse as parseQuery } from 'querystring'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const SettingsPage = ({ currentUser }: SettingsPageResponseBody) => {
  const [displayName, setDisplayName] = useState<string>(
    currentUser.displayName
  )
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const { push, search } = useRouter()
  const {
    globalData: { teams },
  } = useGlobalData()

  const [iconFile, setIconFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(
    currentUser.icon != null ? buildIconUrl(currentUser.icon.location) : null
  )

  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (
        event.target != null &&
        event.target.files != null &&
        event.target.files.length > 0
      ) {
        const file = event.target.files[0]
        setIconFile(file)
        setFileUrl(URL.createObjectURL(file))
      }
    },
    []
  )

  const changeDisplayName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayName(event.target.value)
    },
    []
  )

  const changeInfo = useCallback(
    async (e: any) => {
      e.preventDefault()
      if (currentUser == null) {
        return
      }
      setSending(true)
      const query = parseQuery(search.slice(1))
      try {
        await saveUserInfo({ displayName })
        if (iconFile != null) {
          await updateUserIcon(iconFile)
        }
        const finalRedirect =
          typeof query['redirect'] === 'string'
            ? query['redirect']
            : teams.length > 0
            ? getTeamURL(teams[0])
            : `/settings/use`

        push(finalRedirect)
      } catch (error) {
        setError(error)
      }
      setSending(false)
    },
    [currentUser, displayName, teams, push, iconFile, search]
  )

  return (
    <Page>
      <Container>
        <div className='settings__wrap'>
          <h1>Welcome to Boost Note</h1>
          <p>First, tell us a bit about yourself.</p>

          <form onSubmit={changeInfo}>
            <div className={cc(['row'])}>
              <div className='profile__row'>
                {fileUrl != null ? (
                  <img src={fileUrl} className='profile__pic' />
                ) : (
                  <Icon
                    path={mdiAccountCircleOutline}
                    className='profile__icon'
                    size={100}
                  />
                )}
              </div>
              <label htmlFor='profile' className='profile__label'>
                {fileUrl == null ? 'Add a photo' : 'Change your photo'}
              </label>
              <input
                id='profile'
                name='profile'
                accept='image/*'
                type='file'
                onChange={changeHandler}
              />
            </div>
            <div className={cc(['row'])}>
              <label htmlFor='display-name'>Username</label>
              <input
                type='text'
                name='display-name'
                id='display-name'
                placeholder='Username...'
                value={displayName}
                onChange={changeDisplayName}
              />
            </div>
            {error != null && <ErrorBlock error={error} />}
            <Flexbox justifyContent='center'>
              <Button type='submit' disabled={sending} variant='primary'>
                {sending ? (
                  <Spinner style={{ position: 'relative', top: 0, left: 0 }} />
                ) : (
                  'Continue'
                )}
              </Button>
            </Flexbox>
          </form>
        </div>
      </Container>
    </Page>
  )
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  .profile__icon {
    width: 100px;
    height: 100px;
    color: ${({ theme }) => theme.secondaryBorderColor};
  }
  .profile__row {
    margin: ${({ theme }) => theme.space.small}px 0;
    text-align: center;
  }
  .profile__label {
    font-size: ${({ theme }) => theme.fontSizes.large}px;
    color: ${({ theme }) => theme.subtleTextColor};
    font-weight: 300;
    text-align: center;
    display: block;
    cursor: pointer;
    ${baseIconStyle}
  }
  #profile {
    display: none;
  }
  .profile__pic {
    display: block;
    margin: auto;
    object-fit: cover;
    width: 100px;
    height: 100px;
    background: ${({ theme }) => theme.secondaryBackgroundColor};
    border: 1px solid ${({ theme }) => theme.secondaryBorderColor};
    border-radius: 100%;
  }
  .settings__wrap {
    position: relative;
    width: 600px;
    max-width: 96%;
    margin: 0 auto;
    text-align: center;
  }
  h1 {
    color: ${({ theme }) => theme.emphasizedTextColor};
    font-size: ${({ theme }) => theme.fontSizes.xl}px;
    margin-top: ${({ theme }) => theme.space.xxxlarge}px;
  }
  form {
    text-align: left;
    margin-top: ${({ theme }) => theme.space.xxlarge}px;
    .row {
      margin: 20px 0;
      display: block;
      position: relative;
      label {
        color: ${({ theme }) => theme.subtleTextColor};
      }
      input[type='text'] {
        ${inputStyle}
        position: relative;
        width: 100%;
        height: 50px;
        padding: ${({ theme }) => theme.space.xsmall}px
          ${({ theme }) => theme.space.small}px;
        border: none;
        border-radius: 2px;
        padding-left: ${({ theme }) => theme.space.small}px;
        margin-bottom: 10px;
        ::placeholder {
          color: ${({ theme }) => theme.subtleTextColor};
        }
        &:focus {
          background-color: ${({ theme }) => theme.emphasizedBackgroundColor};
        }
      }
    }
  }
`

SettingsPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getSettingsPageData(params)
  return result
}

export default SettingsPage
