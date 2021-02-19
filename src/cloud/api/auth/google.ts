import { callApi } from '../../lib/client'
import { AddedOAuthParams } from '.'

export type GoogleLoginCallbackRequestBody = {
  accessToken: string
  tokenId: string
  googleId: string
  scope: string
} & AddedOAuthParams

export interface GoogleLoginCallbackResponseBody {
  redirectTo: string
}

export async function postGoogleLoginCallback(
  body: GoogleLoginCallbackRequestBody
) {
  const data = await callApi<GoogleLoginCallbackResponseBody>(
    `api/oauth/google/callback`,
    { json: body, method: 'post' }
  )
  return data
}
