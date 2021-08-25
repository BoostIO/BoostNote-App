import React, { useCallback, useState } from 'react'
import Page from '../../components/Page'
import { useDialog, DialogIconTypes } from '../../../design/lib/stores/dialog'
import { useToast } from '../../../design/lib/stores/toast'
import { useTranslation } from 'react-i18next'
import FeedbackForm from '../../components/FeedbackForm'
import { UserFeedbackFormData } from '../../components/FeedbackForm/types'
import {
  DeleteTeamPageResponseBody,
  getDeleteTeamPageData,
} from '../../api/pages/teams/delete'
import { destroyTeam } from '../../api/teams'
import { sendFeedback } from '../../api/feedback'
import { useElectron } from '../../lib/stores/electron'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { useRouter } from '../../lib/router'
import { LoadingButton } from '../../../design/components/atoms/Button'
import Card from '../../../design/components/atoms/Card'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { useGlobalData } from '../../lib/stores/globalData'

const DeleteTeamPage = ({ team }: DeleteTeamPageResponseBody) => {
  const [sendingRemoval, setSendingRemoval] = useState<boolean>(false)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()
  const { push } = useRouter()
  const { t } = useTranslation()
  const { usingElectron, sendToElectron } = useElectron()
  const { setPartialGlobalData, globalData } = useGlobalData()

  const [feedback, setFeedback] = useState<UserFeedbackFormData>({
    needFeatures: false,
    needCheaper: false,
    needIntegrations: false,
  })

  const onChangeFeedbackHandler = useCallback(
    (obj: Partial<UserFeedbackFormData>) => {
      setFeedback((prev) => {
        return {
          ...prev,
          ...obj,
        }
      })
    },
    [setFeedback]
  )

  const deleteHandler = useCallback(async () => {
    messageBox({
      title: `Delete [${team.name}]?`,
      message: `Are you sure to delete this team and all of its content? You will not be able to revert this action.`,
      iconType: DialogIconTypes.Warning,
      buttons: [
        {
          variant: 'secondary',
          label: 'Cancel',
          cancelButton: true,
          defaultButton: true,
        },
        {
          variant: 'danger',
          label: 'Delete',
          onClick: async () => {
            setSendingRemoval(true)
            try {
              const { redirectTo } = await destroyTeam(team.id)
              try {
                await sendFeedback(feedback)
              } catch (error) {
              } finally {
                const cleanedUpTeams = globalData.teams
                  .slice()
                  .filter((t) => t.id !== team.id)
                setPartialGlobalData({ teams: cleanedUpTeams })
                if (usingElectron) {
                  sendToElectron('team-delete', team)
                } else {
                  push(redirectTo)
                }
              }
            } catch (error) {
              pushMessage({
                title: 'Error',
                description: error.message,
              })
              setSendingRemoval(false)
            }
          },
        },
      ],
    })
  }, [
    messageBox,
    team,
    pushMessage,
    push,
    feedback,
    sendToElectron,
    usingElectron,
    globalData,
    setPartialGlobalData,
  ])

  return (
    <Page>
      <Flexbox style={{ height: '100vh' }} justifyContent='center'>
        <Card title={`Delete your team: ${team.name}?`}>
          <p>
            Please let us know the reasons why so that we can further improve
            our product.
          </p>
          <FeedbackForm
            feedback={feedback}
            onChangeFeedback={onChangeFeedbackHandler}
          />
          <LoadingButton
            spinning={sendingRemoval}
            variant='danger'
            disabled={sendingRemoval}
            onClick={deleteHandler}
          >
            {t('general.delete')}
          </LoadingButton>
        </Card>
      </Flexbox>
    </Page>
  )
}

DeleteTeamPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDeleteTeamPageData(params)
  return result
}

export default DeleteTeamPage
