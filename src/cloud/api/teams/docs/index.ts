import { callApi } from '../../../lib/client'
import {
  SerializedDocWithBookmark,
  SerializedDoc,
  DocStatus,
} from '../../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedTag } from '../../../interfaces/db/tag'

interface GetDocResponseBody {
  doc: SerializedDocWithBookmark
}

export function getDoc(id: string, team: string) {
  return callApi<GetDocResponseBody>(`api/teams/${team}/docs/${id}`)
}

export interface CreateDocRequestBody {
  workspaceId?: string
  parentFolderId?: string
  template?: string
  title?: string
  emoji?: string
}

export interface CreateDocResponseBody {
  doc: SerializedDocWithBookmark
}

export async function createDoc(
  team: { id: string },
  body: CreateDocRequestBody
) {
  const data = await callApi<CreateDocResponseBody>(
    `api/teams/${team.id}/docs`,
    {
      json: body,
      method: 'post',
    }
  )
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
  doc: SerializedDocWithBookmark
}

export async function updateDoc(
  teamId: string,
  docId: string,
  body: UpdateDocRequestBody
) {
  const data = await callApi<UpdateDocResponseBody>(
    `api/teams/${teamId}/docs/${docId}`,
    {
      json: body,
      method: 'put',
    }
  )
  return data
}

export interface DestroyDocResponseBody {
  parentFolder?: SerializedFolderWithBookmark
  workspace?: SerializedWorkspace
  doc?: SerializedDocWithBookmark
}

export async function destroyDoc(team: { id: string }, doc: { id: string }) {
  const data = await callApi<DestroyDocResponseBody>(
    `api/teams/${team.id}/docs/${doc.id}`,
    {
      method: 'delete',
    }
  )

  return data
}

export async function updateDocEmoji(doc: SerializedDoc, emoji?: string) {
  const data = await callApi<UpdateDocResponseBody>(
    `api/teams/${doc.teamId}/docs/${doc.id}/emoji`,
    {
      json: { emoji },
      method: 'put',
    }
  )
  return data
}
export interface UpdateDocStatusResponseBody {
  doc: SerializedDocWithBookmark
}

export async function updateDocStatus(
  teamId: string,
  docId: string,
  status: DocStatus | null
) {
  const data = await callApi<UpdateDocStatusResponseBody>(
    `api/teams/${teamId}/docs/${docId}/status`,
    {
      method: 'put',
      json: {
        status,
      },
    }
  )

  return data
}

export interface UpdateDocDueDateResponseBody {
  doc: SerializedDocWithBookmark
}

export async function updateDocDueDate(
  teamId: string,
  docId: string,
  dueDate: Date | null
) {
  const data = await callApi<UpdateDocStatusResponseBody>(
    `api/teams/${teamId}/docs/${docId}/due-date`,
    {
      method: 'put',
      json: {
        dueDate,
      },
    }
  )

  return data
}

export interface UpdateDocAssigneesResponseBody {
  doc: SerializedDocWithBookmark
}

export async function updateDocAssignees(
  teamId: string,
  docId: string,
  assignees: string[]
) {
  const data = await callApi<UpdateDocAssigneesResponseBody>(
    `api/teams/${teamId}/docs/${docId}/assignees`,
    {
      method: 'put',
      json: {
        assignees,
      },
    }
  )

  return data
}

export interface UpdateDocTagsResponseBody {
  doc: SerializedDocWithBookmark
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
