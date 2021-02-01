import { UserFeedbackFormData } from '../../components/organisms/FeedbackForm/types'
import { callApi } from '../../lib/client'

export async function sendFeedback(body: UserFeedbackFormData) {
  const data = await callApi(`api/feedback`, {
    json: body,
    method: 'post',
  })
  return data
}
