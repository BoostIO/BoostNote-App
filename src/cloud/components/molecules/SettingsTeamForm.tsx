import { mdiDomain } from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import slugify from 'slugify'
import { buildIconUrl } from '../../api/files'
import { updateTeam, updateTeamIcon } from '../../api/teams'
import { SerializedTeam } from '../../interfaces/db/team'
import { useElectron } from '../../lib/stores/electron'
import { useGlobalData } from '../../lib/stores/globalData'
import { usePage } from '../../lib/stores/pageStore'
import styled from '../../lib/styled'
import Flexbox from '../atoms/Flexbox'
import Icon from '../atoms/Icon'
import { Spinner } from '../atoms/Spinner'
import { useRouter } from '../../lib/router'
import { getTeamURL } from '../../lib/utils/patterns'
import { useToast } from '../../../shared/lib/stores/toast'
import Button from '../../../shared/components/atoms/Button'
import SettingInput from '../../../shared/components/organisms/Settings/atoms/SettingInput'
import SettingIconInputLabel from '../../../shared/components/organisms/Settings/atoms/SettingIconInputLabel'

interface SettingsTeamFormProps {
  team: SerializedTeam
  teamConversion?: boolean
}

const SettingsTeamForm = ({ team, teamConversion }: SettingsTeamFormProps) => {
  const [name, setName] = useState<string>(!teamConversion ? team.name : '')
  const [domain, setDomain] = useState<string>(
    !teamConversion ? team.domain : ''
  )
  const [sending, setSending] = useState(false)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(
    team.icon != null ? buildIconUrl(team.icon.location) : null
  )
  const { usingElectron, sendToElectron } = useElectron()
  const { setPartialPageData } = usePage()
  const { setTeamInGlobal } = useGlobalData()
  const { pushMessage } = useToast()
  const router = useRouter()

  const slugDomain = useMemo(() => {
    if (domain == null) {
      return process.env.BOOST_HUB_BASE_URL + '/'
    }
    return (
      process.env.BOOST_HUB_BASE_URL +
      '/' +
      slugify(domain.trim().replace(/[^a-zA-Z0-9\-]/g, ''), {
        replacement: '-',
        lower: true,
      })
    )
  }, [domain])

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

  const updateHandler = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      const currentTeam = team
      if (currentTeam == null || sending) {
        return
      }
      setSending(true)
      try {
        const body: any = { name }
        if (teamConversion) {
          body.domain = domain
          body.personal = false
        }
        const { team: updatedTeam } = await updateTeam(currentTeam.id, body)
        if (iconFile != null) {
          const { icon } = await updateTeamIcon(team, iconFile)
          updatedTeam.icon = icon
        }

        setPartialPageData({ team: updatedTeam })
        setTeamInGlobal(updatedTeam)
        if (usingElectron) {
          sendToElectron('team-update', updatedTeam)
        }
        console.log(router.pathname)
        const subPath = router.pathname.split('/')
        subPath.splice(0, 2)
        const newUrl = `${getTeamURL(updatedTeam)}${
          subPath.length > 0 ? `/${subPath.join('/')}` : ''
        }`
        router.push(newUrl)
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: `Could not update your team information`,
        })
      }
      setSending(false)
    },
    [
      setSending,
      name,
      pushMessage,
      sending,
      setPartialPageData,
      setTeamInGlobal,
      router,
      team,
      domain,
      teamConversion,
      iconFile,
      usingElectron,
      sendToElectron,
    ]
  )

  const label = teamConversion ? 'Team' : 'Space'

  return (
    <Container>
      <form onSubmit={updateHandler}>
        <Flexbox className='form__row' alignItems='baseline'>
          <label>{label} icon</label>
          <Flexbox direction='column' alignItems='baseline'>
            <div className='profile__row'>
              {fileUrl != null ? (
                <img src={fileUrl} className='profile__pic' />
              ) : (
                <Icon path={mdiDomain} className='profile__icon' size={50} />
              )}
              <SettingIconInputLabel htmlFor='profile'>
                <span>
                  {fileUrl == null ? 'Add a photo' : 'Change your photo'}
                </span>
                <input
                  id='profile'
                  name='profile'
                  accept='image/*'
                  type='file'
                  onChange={changeHandler}
                />
              </SettingIconInputLabel>
            </div>
          </Flexbox>
        </Flexbox>
        <Flexbox className='form__row'>
          <label>{label} name</label>
          <SettingInput
            type='text'
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </Flexbox>
        {teamConversion && team.personal && (
          <Flexbox className='form__row' alignItems='baseline'>
            <label>{label} domain</label>
            <Flexbox direction='column' alignItems='baseline'>
              <SettingInput
                type='text'
                value={domain}
                onChange={(ev) => setDomain(ev.target.value)}
              />
              <span className='description'>
                Your url will look like this:
                <span className='underlined'>{slugDomain}</span>
              </span>
              <span className='description'>
                Caution: You can&#39;t change it after creating your team.
              </span>
            </Flexbox>
          </Flexbox>
        )}
        <Flexbox className='form__row' justifyContent='flex-end'>
          <Button disabled={sending} variant='primary' type='submit'>
            {sending ? (
              <Spinner style={{ position: 'relative', top: 0, left: 0 }} />
            ) : teamConversion ? (
              'Create'
            ) : (
              'Update'
            )}
          </Button>
        </Flexbox>
      </form>
    </Container>
  )
}

export default SettingsTeamForm

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  .profile__icon {
    width: 50px;
    height: 50px;
    color: ${({ theme }) => theme.secondaryBorderColor};
  }
  .profile__row {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.space.small}px;
  }
  #profile {
    display: none;
  }
  .profile__pic {
    margin: auto;
    object-fit: cover;
    width: 50px;
    height: 50px;
    background: ${({ theme }) => theme.secondaryBackgroundColor};
    border: 1px solid ${({ theme }) => theme.secondaryBorderColor};
    border-radius: 100%;
  }
  .form__header {
    margin-bottom: ${({ theme }) => theme.space.medium}px;
    button {
      margin-right: ${({ theme }) => theme.space.small}px;
    }
    h5 {
      margin: 0;
    }
  }
  .form__row {
    margin: ${({ theme }) => theme.space.small}px 0;
    > label {
      display: block;
      width: 200px;
      flex: 0 0 auto;
      margin: 0;
      color: ${({ theme }) => theme.subtleTextColor};
    }
    .description {
      font-size: ${({ theme }) => theme.fontSizes.xsmall}px;
      margin-top: ${({ theme }) => theme.space.xsmall}px;
      color: ${({ theme }) => theme.subtleTextColor};
      line-height: ${({ theme }) => theme.fontSizes.xsmall}px;
      .underlined {
        font-weight: 500;
        padding-left: ${({ theme }) => theme.space.xxsmall}px;
        text-decoration: underline;
      }
    }
  }
`
