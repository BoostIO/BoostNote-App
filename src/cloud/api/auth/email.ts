import { AddedOAuthParams } from './index'
import { callApi } from '../../lib/client'

export type CreateLoginEmailRequestRequestBody = {
  email: string
} & AddedOAuthParams

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateLoginEmailRequestResponseBody {}

export async function createLoginEmailRequest(
  body: CreateLoginEmailRequestRequestBody
) {
  const data = await callApi<CreateLoginEmailRequestResponseBody>(
    `api/oauth/email/requests`,
    {
      json: body,
      method: 'post',
    }
  )
  return data
}
