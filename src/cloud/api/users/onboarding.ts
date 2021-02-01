import { UserOnboardingState } from '../../interfaces/db/user'
import { callApi } from '../../lib/client'

export interface UpdateUserOnboardingRequestBody {
  value: string
}

export interface UpdateUserOnboardingResponseBody {
  onboarding: UserOnboardingState
}

export async function updateUserOnboardingProgress(
  state: Partial<UserOnboardingState>
) {
  const body: UpdateUserOnboardingRequestBody = { value: JSON.stringify(state) }
  const response = await callApi(`api/users/onboarding`, {
    json: body,
    method: 'put',
  })
  return response.data as UpdateUserOnboardingResponseBody
}
