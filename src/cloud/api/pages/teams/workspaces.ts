import { callApi } from '../../../lib/client'
import { GeneralAppProps } from '../../../interfaces/api'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { SerializedDoc } from '../../../interfaces/db/doc'
import { SerializedFolder } from '../../../interfaces/db/folder'
import { getResourceFromSlug } from '../../mock/db/utils'

export type WorkspacesShowPageResponseBody = GeneralAppProps & {
  pageWorkspace: SerializedWorkspace
}

export async function getWorkspaceShowPageData({
  pathname,
  search,
  signal,
}: GetInitialPropsParameters) {
  const [, _, ...otherPathnames] = pathname.split('/')
  const [, workspaceId] = getResourceFromSlug(otherPathnames.join('/'))

  const [{ workspace }, { docs }, { folders }] = await Promise.all([
    callApi<{ workspace: SerializedWorkspace }>(
      `api/workspaces/${workspaceId}`,
      { signal, search }
    ),
    callApi<{ docs: SerializedDoc[] }>(`api/docs`, {
      search: { workspaceId, parentFolder: 'root' },
      signal,
    }),
    callApi<{ folders: SerializedFolder[] }>(`api/folders`, {
      search: { workspaceId, parentFolder: 'root' },
      signal,
    }),
  ])

  return {
    pageWorkspace: workspace,
    workspaces: [workspace],
    docs,
    folders,
  }
}
