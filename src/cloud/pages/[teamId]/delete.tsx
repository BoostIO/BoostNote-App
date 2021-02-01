import React, { useCallback, useState } from 'react'
import styled from '../../lib/styled'
import Container from '../../components/layouts/Container'
import Page from '../../components/Page'
import { useDialog, DialogIconTypes } from '../../lib/stores/dialog'
import { useToast } from '../../lib/stores/toast'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import CustomButton from '../../components/atoms/buttons/CustomButton'
import { Spinner } from '../../components/atoms/Spinner'
import FeedbackForm from '../../components/organisms/FeedbackForm'
import { UserFeedbackFormData } from '../../components/organisms/FeedbackForm/types'
import {
  DeleteTeamPageResponseBody,
  getDeleteTeamPageData,
} from '../../api/pages/teams/delete'
import { destroyTeam } from '../../api/teams'
import { sendFeedback } from '../../api/feedback'
import { useElectron } from '../../lib/stores/electron'
import { GetInitialPropsParameters } from '../../interfaces/pages'

const DeleteTeamPage = ({ team }: DeleteTeamPageResponseBody) => {
  const [sendingRemoval, setSendingRemoval] = useState<boolean>(false)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()
  const { push } = useRouter()
  const { t } = useTranslation()
  const { usingElectron, sendToElectron } = useElectron()

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
      buttons: ['Delete', t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        switch (value) {
          case 0:
            //remove
            setSendingRemoval(true)
            try {
              const { redirectTo } = await destroyTeam(team.id)
              try {
                await sendFeedback(feedback)
              } catch (error) {
              } finally {
                if (usingElectron) {
                  sendToElectron('team-delete', team)
                } else {
                  push(redirectTo.href, redirectTo.as)
                }
              }
            } catch (error) {
              pushMessage({
                title: 'Error',
                description: error.message,
              })
              setSendingRemoval(false)
            }

            return
          default:
            return
        }
      },
    })
  }, [
    messageBox,
    t,
    team,
    pushMessage,
    push,
    feedback,
    sendToElectron,
    usingElectron,
  ])

  return (
    <Page>
      <Container>
        <StyledAccountDeletePage>
          <StyledAccountDeleteCard>
            <h1>Delete your team: {team.name}?</h1>

            <p>
              Please let us know the reasons why so that we can further improve
              our product.
            </p>
            <FeedbackForm
              feedback={feedback}
              onChangeFeedback={onChangeFeedbackHandler}
            />
            <CustomButton
              variant='danger'
              disabled={sendingRemoval}
              onClick={deleteHandler}
            >
              {sendingRemoval ? <Spinner /> : t('general.delete')}
            </CustomButton>
          </StyledAccountDeleteCard>
        </StyledAccountDeletePage>
      </Container>
    </Page>
  )
}

DeleteTeamPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDeleteTeamPageData(params)
  return result
}

const StyledAccountDeletePage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`

const StyledAccountDeleteCard = styled.div`
  background-color: ${({ theme }) => theme.subtleBackgroundColor};
  color: ${({ theme }) => theme.baseTextColor};
  box-shadow: ${({ theme }) => theme.baseShadowColor};
  width: 100%;
  max-width: 1000px;
  padding: ${({ theme }) => theme.space.xlarge}px
    ${({ theme }) => theme.space.large}px;
  border-radius: 5px;

  h1,
  p {
    text-align: center;
  }

  .btn-register,
  .btn-registered {
    display: inline-block;
    margin-top: ${({ theme }) => theme.space.default}px;
  }

  .btn-register + .btn-registered {
    margin-left: ${({ theme }) => theme.space.default}px;
  }

  .btn-signin {
    display: block;
    margin: ${({ theme }) => theme.space.large}px auto
      ${({ theme }) => theme.space.small}px;
  }

  .content {
    max-width: 480px;
    width: 96%;
    margin: ${({ theme }) => theme.space.xxlarge}px auto;

    &.flex {
      display: flex;
      justify-content: space-between;
      button {
        flex: 1 1 auto;
        margin: 0 ${({ theme }) => theme.space.default}px;
      }
    }
  }

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xlarge}px;
    margin: ${({ theme }) => theme.space.large}px 0;
  }
`

export default DeleteTeamPage
