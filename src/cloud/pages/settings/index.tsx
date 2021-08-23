import React, { useCallback, useState } from 'react'
import { saveUserInfo, updateUserIcon } from '../../api/users'
import {
  getSettingsPageData,
  SettingsPageResponseBody,
} from '../../api/pages/settings'
import ErrorBlock from '../../components/ErrorBlock'
import cc from 'classcat'
import { getTeamURL } from '../../lib/utils/patterns'
import { buildIconUrl } from '../../api/files'
import { mdiAccountCircleOutline } from '@mdi/js'
import { useGlobalData } from '../../lib/stores/globalData'
import { useRouter } from '../../lib/router'
import { parse as parseQuery } from 'querystring'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import Form from '../../../design/components/molecules/Form'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import FormImage from '../../../design/components/molecules/Form/atoms/FormImage'
import FormRowItem from '../../../design/components/molecules/Form/templates/FormRowItem'
import { LoadingButton } from '../../../design/components/atoms/Button'
import ButtonGroup from '../../../design/components/atoms/ButtonGroup'
import styled from '../../../design/lib/styled'
import OnboardingLayout from '../../components/Onboarding/OnboardingLayout'

const SettingsPage = ({ currentUser }: SettingsPageResponseBody) => {
  const [displayName, setDisplayName] = useState<string>(
    currentUser.displayName
  )
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const {
    globalData: { teams },
    setPartialGlobalData,
  } = useGlobalData()
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(
    currentUser.icon != null ? buildIconUrl(currentUser.icon.location) : null
  )
  const { push, search } = useRouter()

  const changeHandler = useCallback((file: File) => {
    setIconFile(file)
    setFileUrl(URL.createObjectURL(file))
  }, [])

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
        const user = { ...currentUser!, displayName }
        if (iconFile != null) {
          try {
            const { icon } = await updateUserIcon(iconFile)
            user.icon = icon
          } catch (error) {}
        }
        setPartialGlobalData({ currentUser: user })
        const finalRedirect =
          typeof query.redirect === 'string'
            ? query.redirect
            : teams.length > 0
            ? getTeamURL(teams[0])
            : `/cooperate`

        push(finalRedirect)
      } catch (error) {
        setError(error)
      }
      setSending(false)
    },
    [
      currentUser,
      displayName,
      teams,
      push,
      setPartialGlobalData,
      iconFile,
      search,
    ]
  )

  return (
    <OnboardingLayout
      title={'Welcome to Boost Note'}
      subtitle='First, tell us a bit about yourself.'
      contentWidth={600}
    >
      <Container>
        <Form onSubmit={changeInfo} className={cc(['team__edit__form'])}>
          <FormRow fullWidth={true}>
            <FormImage
              onChange={changeHandler}
              defaultUrl={fileUrl != null ? fileUrl : undefined}
              defaultIcon={mdiAccountCircleOutline}
              label={fileUrl == null ? 'Add a photo' : 'Change your photo'}
              iconSize={100}
              className='profile__image'
            />
          </FormRow>
          <FormRow row={{ title: 'Username' }} fullWidth={true}>
            <FormRowItem
              item={{
                type: 'input',
                props: {
                  id: 'display-name',
                  placeholder: 'Username...',
                  value: displayName,
                  onChange: changeDisplayName,
                },
              }}
            />
          </FormRow>
          <FormRow>{error != null && <ErrorBlock error={error} />}</FormRow>
          <FormRow fullWidth={true} className='end__row'>
            <ButtonGroup layout='column' display='flex' flex='1 1 auto'>
              <LoadingButton
                type='submit'
                variant='bordered'
                className='submit-team'
                disabled={sending}
                spinning={sending}
                size='lg'
              >
                Continue
              </LoadingButton>
            </ButtonGroup>
          </FormRow>
        </Form>
      </Container>
    </OnboardingLayout>
  )
}

const Container = styled.div`
  text-align: left;

  .button__variant--bordered {
    width: 300px !important;
  }

  .end__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }
  .profile__image {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    .form__image__label {
      margin-left: 0;
      margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
    }
  }
`

SettingsPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getSettingsPageData(params)
  return result
}

export default SettingsPage
