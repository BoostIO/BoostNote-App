import { callApi } from '../../../lib/client'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { checkUploadSize } from '../../../lib/vercel'

export type AllowedDocTypeImports = 'md' | 'html' | 'doc' | 'md|html'

export interface ImportDocsResponseBody {
  workspace: SerializedWorkspace
  parentFolder?: SerializedFolderWithBookmark
  docs: SerializedDocWithBookmark[]
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
  if (body.parentFolderId != null) {
    formData.set('parentFolderId', body.parentFolderId)
  }
  Array.from(body.files).forEach((file) => {
    checkUploadSize(file.size)
    formData.append('imports[]', file)
  })
  const data = await callApi<ImportDocsResponseBody>(
    `api/teams/${teamId}/docs/import`,
    {
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: 'post',
    }
  )
  return data
}
