import { callApi } from '../../../lib/client'
import { SerializedTeam } from '../../../interfaces/db/team'
import { SerializedFileInfo } from '../../../interfaces/db/storage'
import { SerializedDoc } from '../../../interfaces/db/doc'
import { checkUploadSize } from '../../../lib/vercel'

interface UploadFileResponseBody {
  file: SerializedFileInfo
}

export async function uploadFile(
  team: SerializedTeam,
  file: File,
  doc?: SerializedDoc
) {
  const formData = new FormData()

  checkUploadSize(file.size)

  formData.append('file', file)
  if (doc != null) {
    formData.append('attachTo', doc.id)
  }

  const data = await callApi<UploadFileResponseBody>(
    `api/teams/${team.id}/files`,
    {
      body: formData,
      method: 'post',
    }
  )
  return data
}

export async function deleteFile(team: SerializedTeam, filename: string) {
  const data = await callApi<{}>(
    `api/teams/${team.id}/files/${encodeURIComponent(filename)}`,
    { method: 'delete' }
  )
  return data
}

export function buildTeamFileUrl(team: SerializedTeam, fileId: string) {
  return `/api/teams/${team.id}/files/${fileId}`
}
