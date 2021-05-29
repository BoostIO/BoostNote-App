import { mdiDomain } from '@mdi/js'
import React, { useCallback, useMemo, useState } from 'react'
import slugify from 'slugify'
import { buildIconUrl } from '../../api/files'
import { updateTeam, updateTeamIcon } from '../../api/teams'
import { SerializedTeam } from '../../interfaces/db/team'
import { useElectron } from '../../lib/stores/electron'
import { useGlobalData } from '../../lib/stores/globalData'
import { usePage } from '../../lib/stores/pageStore'
import { useRouter } from '../../lib/router'
import { getTeamURL } from '../../lib/utils/patterns'
import { useToast } from '../../../shared/lib/stores/toast'
import Form from '../../../shared/components/molecules/Form'
import FormRow from '../../../shared/components/molecules/Form/templates/FormRow'
import styled from '../../../shared/lib/styled'

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

  const changeHandler = useCallback((file: File) => {
    setIconFile(file)
    setFileUrl(URL.createObjectURL(file))
  }, [])

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
    <Form
      onSubmit={updateHandler}
      rows={[
        {
          title: 'Logo',
          items: [
            {
              type: 'image',
              props: {
                defaultUrl: fileUrl != null ? fileUrl : undefined,
                defaultIcon: mdiDomain,
                onChange: changeHandler,
                label: fileUrl == null ? 'Add a photo' : 'Change your photo',
              },
            },
          ],
        },
        {
          title: `${label} name`,
          items: [
            {
              type: 'input',
              props: {
                value: name,
                onChange: (ev) => setName(ev.target.value),
              },
            },
          ],
        },
      ]}
      submitButton={{ label: teamConversion ? 'Create' : 'Update' }}
    >
      {teamConversion && team.personal && (
        <FormRow
          row={{
            title: `${label} domain`,
            items: [
              {
                type: 'input',
                props: {
                  value: domain,
                  onChange: (ev) => setDomain(ev.target.value),
                },
              },
            ],
            description: (
              <Description>
                <div className='description'>
                  Your url will look like this:
                  <span className='underlined'>{slugDomain}</span>
                </div>
                <div className='description'>
                  Caution: You can&#39;t change it after creating your team.
                </div>
              </Description>
            ),
          }}
        />
      )}
    </Form>
  )
}

const Description = styled.div`
  .description + .description {
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .underlined {
    font-weight: 500;
    padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    text-decoration: underline;
  }
`

export default SettingsTeamForm
