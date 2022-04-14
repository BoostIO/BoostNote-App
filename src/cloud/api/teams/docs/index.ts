import { callApi } from '../../../lib/client'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedTag } from '../../../interfaces/db/tag'
import { PropData, Props } from '../../../interfaces/db/props'

export interface GetDocResponseBody {
  doc: SerializedDocWithSupplemental
}

export function getDoc(id: string, _team: string) {
  return callApi<GetDocResponseBody>(`api/docs/${id}`)
}

export interface CreateDocRequestBody {
  workspaceId?: string
  parentFolderId?: string
  template?: string
  title?: string
  emoji?: string
  props?: Record<string, PropData | null>
  content?: string
}

export interface CreateDocResponseBody {
  doc: SerializedDocWithSupplemental
}

export async function createDoc(
  team: { id: string },
  body: CreateDocRequestBody
) {
  const data = await callApi<CreateDocResponseBody>(`api/docs`, {
    json: { ...body, teamId: team.id },
    method: 'post',
  })
  return data
}

export interface UpdateDocRequestBody {
  workspaceId: string
  parentFolderId?: string
  title?: string
  emoji?: string | null
}

export interface UpdateDocResponseBody {
  workspaces: SerializedWorkspace[]
  folders: SerializedFolderWithBookmark[]
  doc: SerializedDocWithSupplemental
}

export async function updateDoc(
  _teamId: string,
  docId: string,
  body: UpdateDocRequestBody
) {
  const data = await callApi<UpdateDocResponseBody>(`api/docs/${docId}`, {
    json: body,
    method: 'patch',
  })
  return data
}

export interface DestroyDocResponseBody {
  parentFolder?: SerializedFolderWithBookmark
  workspace?: SerializedWorkspace
  doc?: SerializedDocWithSupplemental
}

export async function destroyDoc(_team: { id: string }, doc: { id: string }) {
  const data = await callApi<DestroyDocResponseBody>(`api/docs/${doc.id}`, {
    method: 'delete',
  })

  return data
}

export async function updateDocEmoji(doc: SerializedDoc, emoji?: string) {
  const data = await callApi<UpdateDocResponseBody>(
    `api/docs/${doc.id}/emoji`,
    {
      json: { emoji },
      method: 'put',
    }
  )
  return data
}

export interface UpdateDocPropsResponseBody {
  data: Props
}

export async function updateDocDueDate(docId: string, dueDate: Date | null) {
  return callApi<UpdateDocPropsResponseBody>(`api/docs/${docId}/props`, {
    method: 'patch',
    json: {
      dueDate: {
        type: 'date',
        data: dueDate,
      },
    },
  })
}

export async function updateUnsignedDocProps(
  docId: string,
  props: Record<string, PropData | null>
) {
  return callApi<UpdateDocPropsResponseBody>(`api/docs/${docId}/props`, {
    method: 'patch',
    json: props,
  })
}

export async function updateDocAssignees(docId: string, assignees: string[]) {
  let body

  if (assignees.length === 0) {
    body = { assignees: null }
  } else {
    body = {
      assignees: {
        type: 'user',
        data: assignees,
      },
    }
  }

  return callApi<UpdateDocPropsResponseBody>(`api/docs/${docId}/props`, {
    method: 'patch',
    json: body,
  })
}

export interface UpdateDocTagsResponseBody {
  doc: SerializedDocWithSupplemental
  tags: SerializedTag[]
}
export async function updateDocTagsInBulk(
  teamId: string,
  docId: string,
  tags: string[]
) {
  const data = await callApi<UpdateDocTagsResponseBody>(
    `api/teams/${teamId}/docs/${docId}/tags/bulk`,
    {
      method: 'put',
      json: {
        tags,
      },
    }
  )

  return data
}
