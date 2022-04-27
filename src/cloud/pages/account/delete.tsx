import React, { useCallback, useState } from 'react'
import { useGlobalData } from '../../lib/stores/globalData'
import Page from '../../components/Page'
import ErrorPage from '../../components/error/ErrorPage'
import { useDialog, DialogIconTypes } from '../../../design/lib/stores/dialog'
import { useTranslation } from 'react-i18next'
import { deleteUser } from '../../api/users'
import FeedbackForm from '../../components/FeedbackForm'
import { UserFeedbackFormData } from '../../components/FeedbackForm/types'
import { useElectron } from '../../lib/stores/electron'
import { boostHubBaseUrl } from '../../lib/consts'
import { useToast } from '../../../design/lib/stores/toast'
import { LoadingButton } from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Card from '../../../design/components/atoms/Card'

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
                window.location.href = `${boostHubBaseUrl}/api/user/signout`
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
      <Flexbox style={{ height: '100vh' }} justifyContent='center'>
        <Card title={t('settings.account.delete')}>
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

export default AccountDeletePage
