import React, { useCallback, useState } from 'react'
import styled from '../../lib/styled'
import Container from '../../components/layouts/Container'
import { useGlobalData } from '../../lib/stores/globalData'
import Page from '../../components/Page'
import ErrorPage from '../../components/organisms/error/ErrorPage'
import { useDialog, DialogIconTypes } from '../../../lib/v2/stores/dialog'
import { useTranslation } from 'react-i18next'
import CustomButton from '../../components/atoms/buttons/CustomButton'
import { Spinner } from '../../components/atoms/Spinner'
import { deleteUser } from '../../api/users'
import FeedbackForm from '../../components/organisms/FeedbackForm'
import { UserFeedbackFormData } from '../../components/organisms/FeedbackForm/types'
import { useElectron } from '../../lib/stores/electron'
import { boostHubBaseUrl } from '../../lib/consts'
import { useToast } from '../../../lib/v2/stores/toast'

const AccountDeletePage = () => {
  const { globalData } = useGlobalData()

  const { currentUser } = globalData

  const [sendingRemoval, setSendingRemoval] = useState<boolean>(false)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()
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
    if (currentUser == null) {
      return
    }

    messageBox({
      title: `Delete your account?`,
      message: `Are you sure to delete this account and all of its content? Your 1-man teams and all of their documents will be removed alongside it.`,
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
              await deleteUser(currentUser.id, feedback)
              if (usingElectron) {
                sendToElectron('account-delete')
              } else {
                window.location.href = `${boostHubBaseUrl}/api/oauth/signout`
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
    currentUser,
    pushMessage,
    feedback,
    usingElectron,
    sendToElectron,
  ])

  if (currentUser == null) {
    return (
      <ErrorPage
        error={{
          name: 'Forbidden',
          message: 'You need to login in order to access this content.',
        }}
      />
    )
  }

  return (
    <Page>
      <Container>
        <StyledAccountDeletePage>
          <StyledAccountDeleteCard>
            <h1>{t('settings.account.delete')}</h1>

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

export default AccountDeletePage
