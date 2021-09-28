import { callApi } from '../../lib/client'
import {
  SerializedInputStream,
  SerializedSource,
} from '../../interfaces/db/inputStream'

export interface GetTeamInputStreamsResponseBody {
  data: SerializedInputStream[]
}

export async function getTeamInputStreams(teamId: string) {
  return callApi<GetTeamInputStreamsResponseBody>(`api/inputStreams`, {
    search: { team: teamId },
    method: 'get',
  })
}

export async function deleteTeamInputStream(streamId: string) {
  return callApi<GetTeamInputStreamsResponseBody>(
    `api/inputStreams/${streamId}`,
    {
      method: 'delete',
    }
  )
}

export interface CreateTeamInputStreamResponseBody {
  data: SerializedInputStream
}

export async function createTeamInputStream(
  teamId: string,
  integrationId: string,
  type: string,
  name: string,
  initialSource?: string
) {
  return callApi<CreateTeamInputStreamResponseBody>(`api/inputStreams`, {
    method: 'post',
    json: {
      team: teamId,
      integration: integrationId,
      type,
      name,
      initialSource,
    },
  })
}

export interface CreateTeamInputStreamSourceResponseBody {
  data: SerializedSource
}

export async function createTeamInputStreamSource(
  streamId: string,
  source: string
) {
  return callApi<CreateTeamInputStreamSourceResponseBody>(
    `api/inputStreams/${streamId}/sources`,
    {
      method: 'post',
      json: {
        source,
      },
    }
  )
}

export async function deleteTeamInputStreamSource(
  streamId: string,
  sourceId: string
) {
  return callApi<CreateTeamInputStreamSourceResponseBody>(
    `api/inputStreams/${streamId}/sources/${sourceId}`,
    {
      method: 'delete',
    }
  )
}
