import { mdiDomain } from '@mdi/js'
import React, { useCallback, useState } from 'react'
import { buildIconUrl } from '../api/files'
import { updateTeam, updateTeamIcon } from '../api/teams'
import { SerializedTeam } from '../interfaces/db/team'
import { useElectron } from '../lib/stores/electron'
import { useGlobalData } from '../lib/stores/globalData'
import { usePage } from '../lib/stores/pageStore'
import { useRouter } from '../lib/router'
import { getTeamURL } from '../lib/utils/patterns'
import { useToast } from '../../design/lib/stores/toast'
import Form from '../../design/components/molecules/Form'
import { useTranslation } from 'react-i18next'
import { lngKeys } from '../../lib/i18n/types'
import { allowedUploadSizeInMb } from '../../lib/upload'

interface SettingsTeamFormProps {
  team: SerializedTeam
}

const SettingsTeamForm = ({ team }: SettingsTeamFormProps) => {
  const [name, setName] = useState<string>(team.name)
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
  const { t } = useTranslation()

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
        const { team: updatedTeam } = await updateTeam(currentTeam.id, body)
        if (iconFile != null) {
          try {
            const { icon } = await updateTeamIcon(team, iconFile)
            updatedTeam.icon = icon
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
        setPartialPageData({ team: updatedTeam })
        setTeamInGlobal(updatedTeam)
        if (usingElectron) {
          sendToElectron('team-update', updatedTeam)
        }
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
      iconFile,
      usingElectron,
      sendToElectron,
    ]
  )

  const labels = { name: t(lngKeys.SpaceName), domain: t(lngKeys.SpaceDomain) }

  return (
    <Form
      onSubmit={updateHandler}
      rows={[
        {
          title: t(lngKeys.GeneralLogo),
          description: t(lngKeys.UploadLimit, {
            sizeInMb: allowedUploadSizeInMb,
          }),
          items: [
            {
              type: 'image',
              props: {
                defaultUrl: fileUrl != null ? fileUrl : undefined,
                defaultIcon: mdiDomain,
                onChange: changeHandler,
              },
            },
          ],
        },
        {
          title: labels.name,
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

        {
          title: t(lngKeys.SpaceDomain),
          items: [
            {
              type: 'input',
              props: {
                value: team.domain,
                readOnly: true,
              },
            },
          ],
        },
      ]}
      submitButton={{
        label: t(lngKeys.GeneralUpdate),
      }}
    />
  )
}

export default SettingsTeamForm
