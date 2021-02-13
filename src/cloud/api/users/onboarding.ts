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
  return callApi<UpdateUserOnboardingResponseBody>(`api/users/onboarding`, {
    json: body,
    method: 'put',
  })
}
