import { AppFeedbackTypeOption } from '../../interfaces/db/userAppFeedback'
import { callApi } from '../../lib/client'

export interface CreateUserAppFeedbackRequestBody {
  type: AppFeedbackTypeOption
  feedback: string
}

export async function registerAppFeedback(
  body: CreateUserAppFeedbackRequestBody
) {
  const result = await callApi(`/api/users/feedback`, {
    json: body,
    method: 'post',
  })
  return result
}
