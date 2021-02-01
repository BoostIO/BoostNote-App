import { SerializedIcon } from '../../interfaces/db/icon'
import { UserFeedbackFormData } from '../../components/organisms/FeedbackForm/types'
import report from '../../lib/analytics'
import { callApi } from '../../lib/client'

export interface SaveUserRequestBody {
  displayName: string
}

export interface UpdateUserIconResponseBody {
  icon: SerializedIcon
}

export interface DeleteUserIconResponseBody {
  id: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteUserResponseBody {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SaveUserResponseBody {}

export async function saveUserInfo(body: SaveUserRequestBody) {
  const response = await callApi(`api/users`, {
    json: body,
    method: 'put',
  })
  return response.data as SaveUserResponseBody
}

export async function updateUserIcon(file: File) {
  const formData = new FormData()
  formData.set('icon', file)
  const response = await callApi('api/users/icon', {
    body: formData,
    method: 'post',
  })
  return response.data as UpdateUserIconResponseBody
}

export async function deleteUserIcon() {
  const response = await callApi('api/users/icon', { method: 'delete' })
  return response.data as DeleteUserIconResponseBody
}

export async function deleteUser(id: string, body: UserFeedbackFormData) {
  const response = await callApi(`api/users/${id}/delete`, {
    json: body,
    method: 'put',
  })
  report('delete_user')
  return response.data as DeleteUserResponseBody
}
