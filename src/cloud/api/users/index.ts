import { SerializedIcon } from '../../interfaces/db/icon'
import { UserFeedbackFormData } from '../../components/FeedbackForm/types'
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
  return callApi<SaveUserResponseBody>(`api/user`, {
    json: body,
    method: 'put',
  })
}

export async function updateUserIcon(file: File) {
  const formData = new FormData()
  formData.set('icon', file)
  return callApi<UpdateUserIconResponseBody>('api/user/icon', {
    body: formData,
    method: 'post',
  })
}

export async function deleteUserIcon() {
  return callApi<DeleteUserIconResponseBody>('api/user/icon', {
    method: 'delete',
  })
}

export async function deleteUser(id: string, body: UserFeedbackFormData) {
  const data = await callApi<DeleteUserResponseBody>(`api/users/${id}`, {
    json: body,
    method: 'delete',
  })
  return data
}
