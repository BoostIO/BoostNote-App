import { callApi } from '../../../lib/client'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'

export type AllowedDocTypeImports = 'md' | 'html' | 'doc' | 'md|html'

export interface ImportDocsResponseBody {
  workspace: SerializedWorkspace
  parentFolder?: SerializedFolderWithBookmark
  docs: SerializedDocWithSupplemental[]
  errors: string[]
}

export interface ImportDocsRequestBody {
  type: AllowedDocTypeImports
  files: FileList
  workspaceId: string
  parentFolderId?: string
}

export async function importDocs(teamId: string, body: ImportDocsRequestBody) {
  const formData = new FormData()
  formData.set('type', body.type)
  formData.set('workspaceId', body.workspaceId)
  formData.set('teamId', teamId)
  if (body.parentFolderId != null) {
    formData.set('parentFolderId', body.parentFolderId)
  }
  Array.from(body.files).forEach((file) => {
    formData.append('imports[]', file)
  })
  const data = await callApi<ImportDocsResponseBody>(`api/docs/import`, {
    body: formData,
    method: 'post',
  })
  return data
}
