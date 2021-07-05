import { SerializedFileInfo } from '../../interfaces/db/storage'
import { callApi } from '../../lib/client'

export type UploadsResponseBody = {
  files: SerializedFileInfo[]
  sizeInMb: number
}

export async function getUploadsData(teamId: string) {
  const data = await callApi<UploadsResponseBody>('api/uploads', {
    search: `teamId=${teamId}`,
  })

  return data
}
